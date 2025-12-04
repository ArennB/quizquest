from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, UserProfile, Attempt, Match
from .serializers import ChallengeSerializer, UserProfileSerializer, AttemptSerializer, MatchSerializer

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
        """Submit quiz attempt and use server-side grading (creates an Attempt)"""
        challenge = self.get_object()
        # Expect client to send 'submitted_answers' (list of {question_id, text, table_entries, time_spent})
        submitted_answers = request.data.get('submitted_answers') or request.data.get('answers', [])
        user_uid = request.data.get('user_uid') or request.data.get('user', None)
        email = request.data.get('email', '')
        display_name = request.data.get('display_name', 'Anonymous')

        # Build attempt payload for serializer
        attempt_payload = {
            'challenge': challenge.id,
            'user_uid': user_uid,
            'submitted_answers': submitted_answers,
            # optional: include a started_at/completed client timestamp or let serializer set times
            'total_time': request.data.get('total_time', 0),
        }

        serializer = AttemptSerializer(data=attempt_payload)
        serializer.is_valid(raise_exception=True)
        attempt = serializer.save()

        # Compute XP same way as AttemptViewSet.create would
        difficulty_multipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0
        }
        multiplier = difficulty_multipliers.get(challenge.difficulty, 1.0)
        base_xp = int(attempt.score * multiplier)
        previous_attempts = Attempt.objects.filter(user_uid=user_uid, challenge=challenge).exclude(id=attempt.id).exists()
        first_time_bonus = 0 if previous_attempts else 50
        perfect_bonus = 25 if attempt.score >= 100 else 0
        total_xp = base_xp + first_time_bonus + perfect_bonus

        # Update / create user profile
        if user_uid:
            user_profile, created = UserProfile.objects.get_or_create(
                firebase_uid=user_uid,
                defaults={'email': email, 'display_name': display_name}
            )
            user_profile.total_xp += total_xp
            user_profile.challenges_completed += 1
            user_profile.save()

        # Attach XP breakdown to response
        response_data = {
            'attempt_id': attempt.id,
            'score': attempt.score,
            'total_time': attempt.total_time,
            'xp_earned': total_xp,
            'xp_breakdown': {
                'base_xp': base_xp,
                'difficulty_multiplier': multiplier,
                'first_time_bonus': first_time_bonus,
                'perfect_bonus': perfect_bonus,
                'total_xp': total_xp
            },
            'graded_answers': attempt.answers
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'firebase_uid'

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    
    def create(self, request, *args, **kwargs):
        """Create attempt and calculate XP (use serializer to perform server-side grading)"""
        # Use submitted_answers if present; serializer will grade and fill score/xp_earned
        submitted_answers = request.data.get('submitted_answers') or request.data.get('answers', [])
        request_data = request.data.copy()
        request_data['submitted_answers'] = submitted_answers

        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        attempt = serializer.save()

        # Get challenge for difficulty multiplier
        challenge = attempt.challenge

        difficulty_multipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0
        }
        multiplier = difficulty_multipliers.get(challenge.difficulty, 1.0)
        base_xp = int(attempt.score * multiplier)

        # Check if first attempt at this challenge (excluding current)
        user_uid = attempt.user_uid
        previous_attempts = Attempt.objects.filter(
            user_uid=user_uid,
            challenge=challenge
        ).exclude(id=attempt.id).exists()
        first_time_bonus = 0 if previous_attempts else 50
        perfect_bonus = 25 if attempt.score >= 100 else 0

        total_xp = base_xp + first_time_bonus + perfect_bonus

        # Update or create user profile
        if user_uid:
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

        # Prepare response (serializer.data would reflect saved Attempt)
        data = serializer.data
        data['xp_earned'] = total_xp
        data['xp_breakdown'] = {
            'base_xp': base_xp,
            'difficulty_multiplier': multiplier,
            'first_time_bonus': first_time_bonus,
            'perfect_bonus': perfect_bonus,
            'total_xp': total_xp
        }
        data['new_total_xp'] = user_profile.total_xp if user_uid else None

        return Response(data, status=status.HTTP_201_CREATED)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    def update(self, request, *args, **kwargs):
        # When an attempt is submitted, update the match and check for winner
        response = super().update(request, *args, **kwargs)
        match = self.get_object()
        if match.attempt1 and match.attempt2 and not match.winner:
            winner = match.determine_winner()
            if winner:
                match.winner = winner
                match.finished_at = timezone.now()
                match.save()
                # Bonus XP logic is in serializer
        return response
