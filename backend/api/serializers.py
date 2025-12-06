from rest_framework import serializers
from .models import Challenge, UserProfile, Attempt

class ChallengeSerializer(serializers.ModelSerializer):
    total_attempts = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Challenge
        fields = '__all__'
        read_only_fields = ['score', 'total_time', 'completed_at']
    
    def get_total_attempts(self, obj):
        return Attempt.objects.filter(challenge=obj).count()
    
    def get_average_rating(self, obj):
        attempts = Attempt.objects.filter(challenge=obj)
        if attempts.exists():
            avg_score = sum(a.score for a in attempts) / attempts.count()
            return round(avg_score / 20, 1)  # Convert to 5-star rating
        return 0
    
    def validate_questions(self, value):
        MIN_CHOICES = 2
        MAX_CHOICES = 8

        if not isinstance(value, list):
            raise serializers.ValidationError("questions must be a list")

        for i, q in enumerate(value):
            if not isinstance(q, dict):
                raise serializers.ValidationError(f"question {i+1} must be an object")
            options = q.get("options") or q.get("choices") or []
            if not isinstance(options, list):
                raise serializers.ValidationError(f"question {i+1} options must be a list")
            if len(options) < MIN_CHOICES or len(options) > MAX_CHOICES:
                raise serializers.ValidationError(
                    f"question {i+1} must have between {MIN_CHOICES} and {MAX_CHOICES} options"
                )
            correct = q.get("correct_answers")
            if correct is None and "correct_answer" in q:
                correct = [q.get("correct_answer")]
            if correct is None:
                raise serializers.ValidationError(f"question {i+1} must include correct_answers")
            if not isinstance(correct, list) or len(correct) == 0:
                raise serializers.ValidationError(f"question {i+1} correct_answers must be a non-empty list")
            # validate indices
            for idx in correct:
                if not isinstance(idx, int) or idx < 0 or idx >= len(options):
                    raise serializers.ValidationError(
                        f"question {i+1} has invalid correct answer index: {idx}"
                    )
        return value

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
    
    

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = "__all__"
        read_only_fields = ["score", "total_time", "completed_at"]

    def create(self, validated_data):
        answers = validated_data.pop("answers", [])
        challenge = validated_data.get("challenge")
        from .models import Challenge
        
        if isinstance(challenge, int):
            try:
                challenge = Challenge.objects.get(pk=challenge)
            except Challenge.DoesNotExist:
                challenge = None
        
        correct_sets = []
        if challenge and getattr(challenge, "questions", None):
            for q in challenge.questions:
                # Accept multiple shapes from older format
                options = q.get("options") or q.get("choices") or []
                correct = q.get("correct_answers")
                if correct is None and "correct_answer" in q:
                    # older single index
                    correct = [q.get("correct_answer")]
                if isinstance(correct, list):
                    # Filter to valid ints within options length
                    valid = [int(x) for x in correct if isinstance(x, int) and 0 <= x < len(options)]
                    correct_sets.append(set(valid))
                else:
                    correct_sets.append(set())
        
        score = 0
        normalized_answers = []
        
        for i, ans in enumerate(answers):
            selected_set = set()
            if isinstance(ans, list):
                selected_set = set([int(x) for x in ans if isinstance(x, int)])
            elif isinstance(ans, dict):
                # support {'selected': [..]} or {'choice': int}
                if "selected" in ans and isinstance(ans["selected"], list):
                    selected_set = set([int(x) for x in ans["selected"] if isinstance(x, int)])
                elif "choice" in ans and isinstance(ans["choice"], int):
                    selected_set = {int(ans["choice"])}
                elif "choice_id" in ans and isinstance(ans["choice_id"], int):
                    selected_set = {int(ans["choice_id"])}
            elif isinstance(ans, int):
                selected_set = {ans}

            correct_set = correct_sets[i] if i < len(correct_sets) else set()
            is_correct = selected_set == correct_set and len(correct_set) > 0

            if is_correct:
                score += 1

            normalized_answers.append({
                "selected": list(selected_set),
                "correct": bool(is_correct)
            })
        
        validated_data["score"] = score
        validated_data["answers"] = normalized_answers

        if validated_data.get("total_time") is None:
            validated_data["total_time"] = 0
        
        return super().create(validated_data)