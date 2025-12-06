from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, UserProfile, Attempt, Match
from .serializers import ChallengeSerializer, UserProfileSerializer, AttemptSerializer, MatchSerializer

def grade_answers(challenge, submitted_answers):
    """
    Grade submitted answers by comparing them against the challenge questions.
    Supports multiple_choice and short_answer (forced_recall) question types.
    Returns (graded_answers list, score as percentage).
    """
    graded_answers = []
    questions = challenge.questions or []
    
    for i, submitted in enumerate(submitted_answers):
        if i >= len(questions):
            break
        
        question = questions[i]
        question_type = question.get('type', 'multiple_choice')
        
        # Handle both dict and string formats
        if isinstance(submitted, str):
            # For short-answer: submitted is just the answer string
            submitted = {'text': submitted}
        
        # Debug output
        import json
        print(f"\n=== QUESTION {i} ({question_type}) ===")
        print(f"Question: {json.dumps(question, indent=2)}")
        print(f"Submitted: {json.dumps(submitted, indent=2)}")

        # Support both dict and int formats for submitted answers
        if isinstance(submitted, dict):
            time_value = submitted.get('time_spent', submitted.get('time', 0))
            answer_value = submitted.get('answer', submitted.get('selected_option', None))
        else:
            time_value = 0
            answer_value = submitted
        graded_answer = {
            'question_id': i,
            'type': question_type,
            'correct': False,
            'time': time_value
        }

        if question_type == 'multiple_choice':
            # Check if selected option matches correct answer
            correct_option = question.get('correct_answer')
            submitted_option = answer_value
            graded_answer['submitted'] = submitted_option
            graded_answer['correct'] = correct_option == submitted_option

        elif question_type == 'forced_recall' or question_type == 'short_answer':
            # For short-answer: check if user's answer matches any acceptable answer
            acceptable_answers = question.get('acceptable_answers', [])
            if isinstance(submitted, dict):
                user_answer = (submitted.get('text') or submitted.get('answer', '')).strip().lower()
            else:
                user_answer = str(submitted).strip().lower()
            graded_answer['submitted'] = user_answer
            graded_answer['acceptable_answers'] = [a.strip().lower() for a in acceptable_answers]
            # Check if user's answer matches any acceptable answer (case-insensitive)
            for acceptable in acceptable_answers:
                normalized_acceptable = acceptable.strip().lower()
                if user_answer == normalized_acceptable:
                    graded_answer['correct'] = True
                    print(f"MATCH FOUND on Q{i}: '{user_answer}' == '{normalized_acceptable}'")
                    break
            
            if not graded_answer['correct']:
                print(f"NO MATCH on Q{i}: user='{user_answer}' vs acceptable={graded_answer['acceptable_answers']}")
        
        graded_answers.append(graded_answer)
    
    # Calculate score as percentage
    if graded_answers:
        correct_count = sum(1 for ans in graded_answers if ans.get('correct'))
        score = int((correct_count / len(graded_answers)) * 100)
    else:
        score = 0
    
    return graded_answers, score

class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer

    @action(detail=False, methods=['post'])
    def import_opentdb(self, request):
        """
        Import quizzes from Open Trivia DB via API.
        Only allow if user is admin or a valid import token is provided.
        Accepts: amount (int), category (int, optional), difficulty (str, optional)
        """
        import requests, html, random
        # SECURITY: Require admin or secret token
        IMPORT_TOKEN = 'YOUR_SECRET_IMPORT_TOKEN'  # TODO: Set this securely, e.g., in env vars
        token = request.headers.get('X-Import-Token') or request.data.get('import_token')
        if not (request.user.is_staff if request.user and request.user.is_authenticated else False) and token != IMPORT_TOKEN:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        amount = int(request.data.get('amount', 10))
        category = request.data.get('category')
        difficulty = request.data.get('difficulty')
        params = {'amount': amount, 'type': 'multiple'}
        if category:
            params['category'] = category
        if difficulty:
            params['difficulty'] = difficulty
        resp = requests.get('https://opentdb.com/api.php', params=params)
        data = resp.json()
        if data.get('response_code') != 0:
            return Response({'detail': 'Error fetching from Open Trivia DB.'}, status=status.HTTP_400_BAD_REQUEST)

        questions = []
        for i, q in enumerate(data['results']):
            options = q['incorrect_answers'] + [q['correct_answer']]
            options = [html.unescape(opt) for opt in options]
            random.shuffle(options)
            correct_index = options.index(html.unescape(q['correct_answer']))
            questions.append({
                'type': 'multiple_choice',
                'question_text': html.unescape(q['question']),
                'options': options,
                'correct_answer': correct_index,
                'question_id': f'opentdb_{i}_{random.randint(1000,9999)}'
            })

        challenge_title = f'Open Trivia DB Import ({amount} questions)'
        if category:
            challenge_title += f' - Category {category}'
        if difficulty:
            challenge_title += f' - {difficulty.capitalize()}'

        challenge = Challenge.objects.create(
            title=challenge_title,
            description='Imported from Open Trivia DB',
            theme=data['results'][0].get('category', 'General') if data['results'] else 'General',
            difficulty=difficulty or 'medium',
            creator_uid='opentdb_import',
            questions=questions
        )
        return Response({'created': ChallengeSerializer(challenge).data}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def import_quizzes(self, request):
        """
        Import one or more quizzes (challenges) via API.
        Only allow if user is admin or a valid import token is provided.
        Expects a list of challenge objects in request.data['quizzes'] or a single challenge object.
        """
        # SECURITY: Require admin or secret token
        IMPORT_TOKEN = 'YOUR_SECRET_IMPORT_TOKEN'  # TODO: Set this securely, e.g., in env vars
        token = request.headers.get('X-Import-Token') or request.data.get('import_token')
        if not (request.user.is_staff if request.user and request.user.is_authenticated else False) and token != IMPORT_TOKEN:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        quizzes = request.data.get('quizzes')
        if not quizzes:
            # Allow single quiz import
            quiz = request.data.get('quiz') or request.data
            quizzes = [quiz]
        created = []
        errors = []
        for quiz in quizzes:
            serializer = ChallengeSerializer(data=quiz)
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
            else:
                errors.append(serializer.errors)
        return Response({'created': created, 'errors': errors}, status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)
    
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'firebase_uid'

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    
    def create(self, request, *args, **kwargs):
        """Create attempt and calculate XP with server-side grading"""
        challenge_id = request.data.get('challenge')
        challenge = Challenge.objects.get(id=challenge_id)
        
        submitted_answers = request.data.get('submitted_answers') or request.data.get('answers', [])
        
        # Grade the answers
        graded_answers, score = grade_answers(challenge, submitted_answers)
        
        request_data = request.data.copy()
        request_data['submitted_answers'] = submitted_answers
        request_data['answers'] = graded_answers
        request_data['score'] = score

        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        attempt = serializer.save()

        # Get challenge for difficulty multiplier
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
