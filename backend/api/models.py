from django.db import models

# Create your models here.

class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    theme = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    creator_uid = models.CharField(max_length=128)  # Firebase UID
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)
    play_count = models.IntegerField(default=0)
    questions = models.JSONField(default=list)  # Store questions as JSON
    
    def __str__(self):
        return self.title

class UserProfile(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True)
    email = models.EmailField()
    display_name = models.CharField(max_length=100)
    total_xp = models.IntegerField(default=0)
    challenges_completed = models.IntegerField(default=0)
    
    def __str__(self):
        return self.display_name

class Attempt(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user_uid = models.CharField(max_length=128)  # Firebase UID
    score = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)
    total_time = models.IntegerField()  # seconds
    answers = models.JSONField(default=list)
    
    def __str__(self):
        return f"{self.user_uid} - {self.challenge.title}"
