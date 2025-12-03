from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Challenge, UserProfile, Attempt

class APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a sample challenge
        self.challenge = Challenge.objects.create(
            title="Math Quiz",
            theme="math",
            difficulty="easy",
            is_published=True
        )

        # Create user profile
        self.user = UserProfile.objects.create(
            firebase_uid="test123",
            email="test@example.com",
            display_name="Tester"
        )

    # -------------------------------
    # Challenge Tests
    # -------------------------------
    def test_get_challenges_list(self):
        response = self.client.get("/api/challenges/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_challenges_by_theme(self):
        response = self.client.get("/api/challenges/by_theme/?theme=math")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_submit_attempt(self):
        data = {
            "answers": [
                {"isCorrect": True},
                {"isCorrect": False},
                {"isCorrect": True}
            ]
        }
        response = self.client.post(
            f"/api/challenges/{self.challenge.id}/submit_attempt/",
            data,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("score", response.json())

    # -------------------------------
    # Attempt Tests
    # -------------------------------
    def test_create_attempt(self):
        data = {
            "user_uid": "test123",
            "challenge": self.challenge.id,
            "score": 100,
            "email": "test@example.com",
            "display_name": "Tester"
        }

        response = self.client.post("/api/attempts/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("xp_earned", response.json())
        self.assertIn("xp_breakdown", response.json())

    # -------------------------------
    # User Tests
    # -------------------------------
    def test_get_users(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_user(self):
        response = self.client.get("/api/users/test123/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
