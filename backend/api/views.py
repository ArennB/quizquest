from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, UserProfile, Attempt
from .serializers import ChallengeSerializer, UserProfileSerializer, AttemptSerializer

class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    
    @action(detail=False, methods=['get'])
    def by_theme(self, request):
        """Get challenges by theme"""
        theme = request.query_params.get('theme')
        challenges = Challenge.objects.filter(theme=theme, is_published=True)
        serializer = self.get_serializer(challenges, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        """Submit quiz attempt"""
        challenge = self.get_object()
        answers = request.data.get('answers', [])
        
        # Simple score calculation
        correct = sum(1 for ans in answers if ans.get('isCorrect'))
        total = len(answers)
        score = (correct / total * 100) if total > 0 else 0
        
        # Calculate XP
        xp = int(score * 2)
        
        return Response({
            'score': score,
            'correct_answers': correct,
            'total_questions': total,
            'xp_earned': xp
        })

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'firebase_uid'

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    
    def create(self, request, *args, **kwargs):
        """Create attempt and calculate XP"""
        user_uid = request.data.get('user_uid')
        challenge_id = request.data.get('challenge')
        score = request.data.get('score', 0)
        
        # Get challenge for difficulty multiplier
        challenge = Challenge.objects.get(id=challenge_id)
        
        # Calculate XP
        difficulty_multipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0
        }
        multiplier = difficulty_multipliers.get(challenge.difficulty, 1.0)
        base_xp = int(score * multiplier)
        
        # Check if first attempt at this challenge
        previous_attempts = Attempt.objects.filter(
            user_uid=user_uid,
            challenge=challenge
        ).exists()
        
        first_time_bonus = 0 if previous_attempts else 50
        perfect_bonus = 25 if score >= 100 else 0
        
        total_xp = base_xp + first_time_bonus + perfect_bonus
        
        # Create the attempt
        response = super().create(request, *args, **kwargs)
        
        # Update or create user profile
        user_profile, created = UserProfile.objects.get_or_create(
            firebase_uid=user_uid,
            defaults={
                'email': request.data.get('email', ''),
                'display_name': request.data.get('display_name', 'Anonymous')
            }
        )
        user_profile.total_xp += total_xp
        user_profile.challenges_completed += 1
        user_profile.save()
        
        # Add XP info to response
        response.data['xp_earned'] = total_xp
        response.data['xp_breakdown'] = {
            'base_xp': base_xp,
            'difficulty_multiplier': multiplier,
            'first_time_bonus': first_time_bonus,
            'perfect_bonus': perfect_bonus,
            'total_xp': total_xp
        }
        response.data['new_total_xp'] = user_profile.total_xp
        
        return response
