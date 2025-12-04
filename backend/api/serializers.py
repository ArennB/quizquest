from rest_framework import serializers
from .models import Challenge, UserProfile, Attempt, Match

class ChallengeSerializer(serializers.ModelSerializer):
    total_attempts = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
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

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = '__all__'
        read_only_fields = ["score", "total_time", "completed_at"]

    def create(self, validated_data):
        answers = validated_data.get("answers", [])

        score = sum(1 for ans in answers if ans.get("correct") is True)
        total_time = sum(ans.get("time", 0) for ans in answers)

        validated_data["score"] = score
        validated_data["total_time"] = total_time

        return super().create(validated_data)

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

    def update(self, instance, validated_data):
        # When both attempts are present, determine winner and award XP
        instance = super().update(instance, validated_data)
        if instance.attempt1 and instance.attempt2 and not instance.winner:
            winner = instance.determine_winner()
            if winner:
                instance.winner = winner
                instance.finished_at = timezone.now()
                instance.save()
                # Award bonus XP to winner
                winner.total_xp += 50  # or any bonus value
                winner.save()
        return instance
