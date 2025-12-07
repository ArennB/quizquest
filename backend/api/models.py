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

    # Single JSONField to hold question list (multiple_choice / short_answer / forced_recall)
    questions = models.JSONField(
        null=True,
        blank=True,
        default=list,
        help_text="List of question objects (type, text, acceptable_answers, table_entries, etc.)"
    )
    
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
    user_uid = models.CharField(max_length=128, null=True, blank=True)  # Firebase UID (nullable for anonymous)
    
    # Raw submitted answers (as sent from client) for auditing/replay
    submitted_answers = models.JSONField(
        null=True,
        blank=True,
        default=list,
        help_text="Raw submitted answers from client (used for auditing / replay)"
    )

    # Server-graded answers/results (is_correct, points_earned, table_results, etc.)
    answers = models.JSONField(
        null=True,
        blank=True,
        default=list,
        help_text="Graded answers/results saved by server"
    )

    # Numeric tracking fields (set by server-side grading)
    score = models.IntegerField(default=0, help_text="Score as percent (0-100)")
    total_time = models.IntegerField(default=0, help_text="Total time in seconds")
    xp_earned = models.IntegerField(default=0)

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_uid or 'anon'} - {self.challenge.title}"

class Match(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    player1 = models.ForeignKey(UserProfile, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(UserProfile, related_name='matches_as_player2', on_delete=models.CASCADE)
    attempt1 = models.ForeignKey('Attempt', related_name='match_attempt1', null=True, blank=True, on_delete=models.SET_NULL)
    attempt2 = models.ForeignKey('Attempt', related_name='match_attempt2', null=True, blank=True, on_delete=models.SET_NULL)
    winner = models.ForeignKey(UserProfile, related_name='matches_won', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def determine_winner(self):
        if self.attempt1 and self.attempt2:
            # Compare scores, then total_time as tiebreaker
            if self.attempt1.score > self.attempt2.score:
                return self.player1
            elif self.attempt2.score > self.attempt1.score:
                return self.player2
            else:
                # Tie: lower total_time wins
                if self.attempt1.total_time < self.attempt2.total_time:
                    return self.player1
                elif self.attempt2.total_time < self.attempt1.total_time:
                    return self.player2
        return None

    def __str__(self):
        return f"Match: {self.player1} vs {self.player2} on {self.challenge.title}"
