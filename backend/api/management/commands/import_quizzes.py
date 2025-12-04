import requests
import html
from django.core.management.base import BaseCommand
from api.models import Challenge

class Command(BaseCommand):
    help = 'Import quizzes from Open Trivia DB into Challenge model.'

    def add_arguments(self, parser):
        parser.add_argument('--amount', type=int, default=10, help='Number of questions to import')
        parser.add_argument('--category', type=int, help='Category ID (optional, see https://opentdb.com/api_category.php)')
        parser.add_argument('--difficulty', type=str, choices=['easy', 'medium', 'hard'], help='Difficulty (optional)')

    def handle(self, *args, **options):
        url = 'https://opentdb.com/api.php'
        params = {
            'amount': options['amount'],
            'type': 'multiple',
        }
        if 'category' in options and options['category']:
            params['category'] = options['category']
        if 'difficulty' in options and options['difficulty']:
            params['difficulty'] = options['difficulty']

        cat_str = f" | Category: {options['category']}" if 'category' in options and options['category'] else ''
        diff_str = f" | Difficulty: {options['difficulty']}" if 'difficulty' in options and options['difficulty'] else ''
        self.stdout.write(f'Fetching {params["amount"]} questions from Open Trivia DB{cat_str}{diff_str}...')
        resp = requests.get(url, params=params)
        data = resp.json()
        if data['response_code'] != 0:
            self.stderr.write('Error fetching questions from Open Trivia DB.')
            return

        questions = []
        for i, q in enumerate(data['results']):
            options = q['incorrect_answers'] + [q['correct_answer']]
            options = [html.unescape(opt) for opt in options]
            # Shuffle options so correct answer isn't always last
            import random
            random.shuffle(options)
            correct_index = options.index(html.unescape(q['correct_answer']))
            questions.append({
                'type': 'multiple_choice',
                'question_text': html.unescape(q['question']),
                'options': options,
                'correct_answer': correct_index,
                'question_id': f'opentdb_{i}_{random.randint(1000,9999)}'
            })

        challenge_title = f'Open Trivia DB Import ({params["amount"]} questions)'
        if 'category' in options and options['category']:
            challenge_title += f' - Category {options["category"]}'
        if 'difficulty' in options and options['difficulty']:
            challenge_title += f' - {options["difficulty"].capitalize()}'

        challenge = Challenge.objects.create(
            title=challenge_title,
            description='Imported from Open Trivia DB',
            theme=q.get('category', 'General'),
            difficulty=q.get('difficulty', 'medium'),
            creator_uid='opentdb_import',
            questions=questions
        )
        self.stdout.write(self.style.SUCCESS(f'Imported {len(questions)} questions as challenge: {challenge.title}'))
