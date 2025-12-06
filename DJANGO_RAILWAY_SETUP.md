# QuizQuest Django Backend on Railway

Complete guide for deploying Django backend on Railway to work with Firebase frontend.

---

## 🚂 Why Railway?

- ✅ **Easiest Django deployment** (literally 3 commands)
- ✅ **PostgreSQL included** (one-click setup)
- ✅ **Auto-deploy from GitHub**
- ✅ **Free $5 credit** to start
- ✅ **Perfect for Firebase integration**

---

## 📁 Project Structure

```
quizquest/
├── frontend/              # React + Firebase (already exists)
│   ├── src/
│   └── firebase.js
│
└── backend/               # Django (we'll create this)
    ├── manage.py
    ├── requirements.txt
    ├── railway.json
    ├── Procfile
    ├── quizquest/
    │   ├── settings.py
    │   └── urls.py
    └── api/
        ├── models.py
        ├── views.py
        └── serializers.py
```

---

## 🛠️ Setup Steps

### **Step 1: Install Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### **Step 2: Create Django Project**

```bash
# Navigate to your project
cd quizquest

# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django and dependencies
pip install django djangorestframework django-cors-headers python-decouple gunicorn psycopg2-binary firebase-admin whitenoise dj-database-url

# Create Django project
django-admin startproject quizquest .

# Create API app
python manage.py startapp api
```

### **Step 3: Configure Django for Railway**

Create these files in `backend/`:

#### **requirements.txt**
```txt
Django==5.0
djangorestframework==3.14.0
django-cors-headers==4.3.1
python-decouple==3.8
gunicorn==21.2.0
psycopg2-binary==2.9.9
firebase-admin==6.3.0
whitenoise==6.6.0
dj-database-url==2.1.0
```

#### **Procfile**
```
web: gunicorn quizquest.wsgi --log-file -
```

#### **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **runtime.txt**
```
python-3.11.7
```

---

### **Step 4: Update Django Settings**

Edit `backend/quizquest/settings.py`:

```python
import os
import dj_database_url
from decouple import config

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',  # Allow Railway domains
    'quizquest-f6477.web.app',  # Your Firebase domain
    'quizquest-f6477.firebaseapp.com',
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for Firebase frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Vite dev server
    'http://localhost:3000',
    'https://quizquest-f6477.web.app',
    'https://quizquest-f6477.firebaseapp.com',
]

CORS_ALLOW_CREDENTIALS = True

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.FirebaseAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
```

---

### **Step 5: Create Django Models & API**

Create `backend/api/models.py`:

```python
from django.db import models

class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    firebase_id = models.CharField(max_length=128, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    theme = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    creator_uid = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)
    play_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
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
```

Create `backend/api/authentication.py`:

```python
from rest_framework import authentication, exceptions
from firebase_admin import auth, credentials, initialize_app
import firebase_admin

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate('path/to/serviceAccountKey.json')
    initialize_app(cred)

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
        
        try:
            # Extract token
            token = auth_header.split(' ')[1]
            
            # Verify Firebase token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Return user (you can create/get Django user here if needed)
            return (uid, None)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
```

Create `backend/api/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, UserProfile
from .serializers import ChallengeSerializer, UserProfileSerializer

class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.filter(is_published=True)
    serializer_class = ChallengeSerializer
    
    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        """Submit quiz attempt and calculate score"""
        challenge = self.get_object()
        answers = request.data.get('answers', [])
        
        # Calculate score (implement your logic)
        score = self.calculate_score(challenge, answers)
        
        return Response({
            'score': score,
            'xp_earned': self.calculate_xp(score)
        })
    
    def calculate_score(self, challenge, answers):
        # Your scoring logic
        return 85.5
    
    def calculate_xp(self, score):
        # Your XP calculation
        return int(score * 2)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'firebase_uid'
```

Create `backend/api/serializers.py`:

```python
from rest_framework import serializers
from .models import Challenge, UserProfile

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
```

Update `backend/quizquest/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import ChallengeViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'challenges', ChallengeViewSet)
router.register(r'users', UserProfileViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

---

### **Step 6: Deploy to Railway**

```bash
# Make sure you're in backend/ directory
cd backend

# Initialize Railway project
railway init

# Link to Railway project
railway link

# Add PostgreSQL database
railway add postgresql

# Deploy!
railway up

# Your Django backend is now live! 🎉
# Railway will give you a URL like:
# https://quizquest-backend-production.up.railway.app
```

---

## 🔧 Railway Environment Variables

Set these in Railway dashboard:

```
SECRET_KEY=your-django-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://... (automatically set by Railway)
ALLOWED_HOSTS=.railway.app,quizquest-f6477.web.app
```

---

## 🔗 Connect Frontend to Django Backend

Update your React app to call Django API:

```javascript
// src/config/api.js
export const DJANGO_API = 'https://quizquest-backend-production.up.railway.app/api';

// src/services/djangoService.js
import { auth } from '../firebase';
import { DJANGO_API } from '../config/api';

export const createChallenge = async (challengeData) => {
  const token = await auth.currentUser.getIdToken();
  
  const response = await fetch(`${DJANGO_API}/challenges/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(challengeData)
  });
  
  return response.json();
};

export const submitQuizAttempt = async (challengeId, answers) => {
  const token = await auth.currentUser.getIdToken();
  
  const response = await fetch(`${DJANGO_API}/challenges/${challengeId}/submit_attempt/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  
  return response.json();
};
```

---

## 🎯 Backend Team Task Distribution

### **Developer 1: Authentication & User Management**
- Firebase token verification
- User profile CRUD
- Stats tracking

### **Developer 2: Challenge Management**
- Challenge CRUD operations
- Quiz validation
- Challenge statistics

### **Developer 3: Game Logic & Scoring**
- Score calculation
- XP calculation
- Leaderboard updates
- Badge system

---

## 📊 Railway Dashboard

Access your deployed app:
- **Dashboard:** https://railway.app/dashboard
- **Logs:** Real-time logs in Railway dashboard
- **Database:** PostgreSQL admin interface
- **Metrics:** CPU, memory, bandwidth usage

---

## 🔄 Continuous Deployment

Railway auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: add new API endpoint"
git push origin main

# Railway automatically deploys! 🚀
```

---

## 💰 Cost Estimate

- **Free $5 credit:** ~500 hours of usage
- **After credit:** $5-10/month for small projects
- **PostgreSQL:** Included in plan

---

## 🐛 Debugging

View logs in Railway:
```bash
railway logs
```

Or in Railway dashboard: https://railway.app/dashboard

---

## ✅ Checklist

- [ ] Install Railway CLI
- [ ] Create Django project
- [ ] Configure settings.py
- [ ] Create models and API
- [ ] Deploy to Railway
- [ ] Add PostgreSQL
- [ ] Set environment variables
- [ ] Test API endpoints
- [ ] Connect frontend
- [ ] Celebrate! 🎉

---

Need help? Check Railway docs: https://docs.railway.app/

Your Django backend will be live in ~15 minutes! 🚂
