from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Make a user a staff member (admin)'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to promote')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            user.is_staff = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ User "{username}" is now a staff member and can access the admin dashboard!'
                )
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'✗ User "{username}" does not exist.')
            )
