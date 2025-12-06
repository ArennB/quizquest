from django.contrib import admin
from .models import Challenge, UserProfile, Attempt

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'theme', 'difficulty', 'play_count', 'created_at']
    list_filter = ['difficulty', 'theme', 'is_published']
    search_fields = ['title', 'description']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'email', 'total_xp', 'challenges_completed']

@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ['user_uid', 'challenge', 'score', 'completed_at']
