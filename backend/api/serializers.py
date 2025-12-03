import re
from difflib import SequenceMatcher
from rest_framework import serializers
from .models import Challenge, UserProfile, Attempt

class TableEntrySerializer(serializers.Serializer):
    """Single entry in a forced-recall table (e.g., name, year, role)"""
    entry_id = serializers.CharField()
    label = serializers.CharField()  # e.g., "Character Name", "Birth Year"
    acceptable_answers = serializers.ListField(child=serializers.CharField())
    points = serializers.IntegerField(default=10)
    order = serializers.IntegerField(default=0)  # Display order

class QuestionSerializer(serializers.Serializer):
    """Serializer for challenge questions (multiple choice and short answer)"""
    question_id = serializers.CharField()
    type = serializers.ChoiceField(choices=['multiple_choice', 'short_answer', 'forced_recall'])
    text = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField(), required=False, allow_null=True)
    correct_answer = serializers.CharField(required=False, allow_null=True)
    acceptable_answers = serializers.ListField(child=serializers.CharField(), required=False, allow_null=True)
    match_regex = serializers.CharField(required=False, allow_null=True)
    case_sensitive = serializers.BooleanField(default=False)
    points = serializers.IntegerField(default=10)
    time_limit = serializers.IntegerField(required=False, allow_null=True)
    
    # Forced-recall specific fields
    is_forced_recall = serializers.BooleanField(default=False)
    table_entries = TableEntrySerializer(many=True, required=False, allow_null=True)
    table_title = serializers.CharField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_null=True)

class ChallengeSerializer(serializers.ModelSerializer):
    total_attempts = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Challenge
        fields = '__all__'
    
    def get_total_attempts(self, obj):
        return Attempt.objects.filter(challenge=obj).count()
    
    def get_average_rating(self, obj):
        attempts = Attempt.objects.filter(challenge=obj)
        if attempts.exists():
            avg_score = sum(a.score for a in attempts) / attempts.count()
            return round(avg_score / 20, 1)  # Convert to 5-star rating
        return 0

class UserProfileSerializer(serializers.ModelSerializer):
    total_score = serializers.SerializerMethodField()
    average_time = serializers.SerializerMethodField()
    fastest_time = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = '__all__'
    
    def get_total_score(self, obj):
        attempts = Attempt.objects.filter(user_uid=obj.firebase_uid)
        return sum(a.score for a in attempts)
    
    def get_average_time(self, obj):
        attempts = Attempt.objects.filter(user_uid=obj.firebase_uid)
        if attempts.exists():
            avg = sum(a.total_time for a in attempts) / attempts.count()
            return int(avg)
        return 0
    
    def get_fastest_time(self, obj):
        attempts = Attempt.objects.filter(user_uid=obj.firebase_uid)
        if attempts.exists():
            return min(a.total_time for a in attempts)
        return 0

class SubmittedAnswerSerializer(serializers.Serializer):
    """Serializer for submitted answers during quiz attempt"""
    question_id = serializers.CharField()
    text = serializers.CharField(required=False, allow_null=True)
    time_spent = serializers.IntegerField(default=0)
    # For forced-recall: map of entry_id -> user answer
    table_entries = serializers.DictField(child=serializers.CharField(), required=False, allow_null=True)

class GradeAnswerService:
    """Service to grade short-answer and forced-recall questions with fuzzy matching"""
    
    @staticmethod
    def normalize(text):
        """Normalize text: lowercase, remove punctuation/diacritics, trim whitespace"""
        if not text:
            return ""
        import unicodedata
        text = unicodedata.normalize('NFKD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        text = text.lower()
        text = re.sub(r'[^\w\s]|_', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    @staticmethod
    def levenshtein_similarity(s1, s2):
        """Calculate Levenshtein distance and return similarity ratio (0-1)"""
        s1 = GradeAnswerService.normalize(s1)
        s2 = GradeAnswerService.normalize(s2)
        matcher = SequenceMatcher(None, s1, s2)
        return matcher.ratio()
    
    @staticmethod
    def grade_short_answer(user_answer, question_data, similarity_threshold=0.8):
        """
        Grade a short-answer question.
        Returns: {'is_correct': bool, 'points_earned': int}
        """
        user_text = user_answer.strip()
        is_correct = False
        
        # Try regex match first (if provided)
        if question_data.get('match_regex'):
            try:
                flags = 0 if question_data.get('case_sensitive', False) else re.IGNORECASE
                regex = re.compile(question_data['match_regex'], flags)
                if regex.search(user_text):
                    is_correct = True
            except re.error:
                pass  # Ignore malformed regex
        
        # Try exact/fuzzy match against acceptable answers
        if not is_correct and question_data.get('acceptable_answers'):
            for acceptable in question_data['acceptable_answers']:
                norm_acceptable = GradeAnswerService.normalize(acceptable)
                norm_user = GradeAnswerService.normalize(user_text)
                
                if norm_acceptable == norm_user:
                    is_correct = True
                    break
                
                # Fuzzy match
                similarity = GradeAnswerService.levenshtein_similarity(user_text, acceptable)
                if similarity >= similarity_threshold:
                    is_correct = True
                    break
        
        points_earned = question_data.get('points', 10) if is_correct else 0
        return {'is_correct': is_correct, 'points_earned': points_earned}
    
    @staticmethod
    def grade_forced_recall(table_entries_submitted, table_entries_config, similarity_threshold=0.8):
        """
        Grade a forced-recall question (table-based, memory-driven).
        
        Args:
            table_entries_submitted: dict of {entry_id: user_answer}
            table_entries_config: list of entry configs with acceptable_answers, points, etc.
            similarity_threshold: fuzzy match threshold (0-1)
        
        Returns:
            {
                'entries': [
                    {'entry_id': str, 'is_correct': bool, 'points_earned': int, 'user_answer': str},
                    ...
                ],
                'total_correct': int,
                'total_filled': int,
                'total_points_earned': int,
                'total_possible_points': int
            }
        """
        result_entries = []
        total_correct = 0
        total_filled = 0
        total_points_earned = 0
        total_possible_points = 0
        
        for entry_config in table_entries_config:
            entry_id = entry_config.get('entry_id')
            user_answer = table_entries_submitted.get(entry_id, '').strip()
            is_correct = False
            points_earned = 0
            entry_points = entry_config.get('points', 10)
            total_possible_points += entry_points
            
            if user_answer:
                total_filled += 1
                acceptable_answers = entry_config.get('acceptable_answers', [])
                
                for acceptable in acceptable_answers:
                    norm_acceptable = GradeAnswerService.normalize(acceptable)
                    norm_user = GradeAnswerService.normalize(user_answer)
                    
                    if norm_acceptable == norm_user:
                        is_correct = True
                        break
                    
                    # Fuzzy match
                    similarity = GradeAnswerService.levenshtein_similarity(user_answer, acceptable)
                    if similarity >= similarity_threshold:
                        is_correct = True
                        break
                
                if is_correct:
                    total_correct += 1
                    points_earned = entry_points
                    total_points_earned += points_earned
            
            result_entries.append({
                'entry_id': entry_id,
                'label': entry_config.get('label', ''),
                'is_correct': is_correct,
                'points_earned': points_earned,
                'user_answer': user_answer,
                'is_filled': bool(user_answer)
            })
        
        return {
            'entries': result_entries,
            'total_correct': total_correct,
            'total_filled': total_filled,
            'total_points_earned': total_points_earned,
            'total_possible_points': total_possible_points
        }

class AttemptSerializer(serializers.ModelSerializer):
    submitted_answers = SubmittedAnswerSerializer(many=True, write_only=True)
    
    class Meta:
        model = Attempt
        fields = '__all__'
        read_only_fields = ["score", "total_time", "completed_at", "xp_earned"]

    def create(self, validated_data):
        submitted_answers = validated_data.pop("submitted_answers", [])
        challenge = validated_data.get("challenge")
        
        # Grade answers server-side
        questions = challenge.questions if hasattr(challenge, 'questions') else []
        result_answers = []
        correct_count = 0
        total_points = 0
        earned_points = 0
        
        for question in questions:
            submitted = next((a for a in submitted_answers if a['question_id'] == question['question_id']), None)
            is_correct = False
            points_earned = 0
            question_points = question.get('points', 10)
            total_points += question_points
            
            if submitted:
                if question['type'] == 'short_answer':
                    grade_result = GradeAnswerService.grade_short_answer(
                        submitted.get('text', ''),
                        question,
                        similarity_threshold=0.8
                    )
                    is_correct = grade_result['is_correct']
                    points_earned = grade_result['points_earned']
                
                elif question['type'] == 'forced_recall':
                    table_entries_submitted = submitted.get('table_entries', {})
                    table_entries_config = question.get('table_entries', [])
                    
                    grade_result = GradeAnswerService.grade_forced_recall(
                        table_entries_submitted,
                        table_entries_config,
                        similarity_threshold=0.8
                    )
                    
                    is_correct = grade_result['total_filled'] == grade_result['total_correct']
                    points_earned = grade_result['total_points_earned']
                    total_points += grade_result['total_possible_points'] - question_points
                    earned_points += points_earned
                    
                    result_answers.append({
                        'question_id': question['question_id'],
                        'type': 'forced_recall',
                        'table_results': grade_result['entries'],
                        'total_filled': grade_result['total_filled'],
                        'total_correct': grade_result['total_correct'],
                        'time_spent': submitted.get('time_spent', 0)
                    })
                    continue
                
                elif question['type'] == 'multiple_choice':
                    is_correct = submitted.get('text') == question.get('correct_answer')
                    points_earned = question_points if is_correct else 0
            
            if is_correct:
                correct_count += 1
            earned_points += points_earned
            
            result_answers.append({
                'question_id': question['question_id'],
                'type': question['type'],
                'user_answer': submitted.get('text', '') if submitted else '',
                'is_correct': is_correct,
                'points_earned': points_earned,
                'time_spent': submitted.get('time_spent', 0) if submitted else 0
            })
        
        score_percent = round((earned_points / total_points * 100)) if total_points > 0 else 0
        total_time = sum(a.get('time_spent', 0) for a in result_answers)
        
        validated_data["score"] = score_percent
        validated_data["total_time"] = total_time
        validated_data["xp_earned"] = earned_points
        validated_data["answers"] = result_answers

        return super().create(validated_data)
