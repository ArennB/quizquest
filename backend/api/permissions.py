from rest_framework.permissions import BasePermission

class IsCreatorOrReadOnly(BasePermission):
    """
    Only allow creators of the object to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE methods (GET, LIST) are ok for everyone
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        
        return obj.creator_uid == request.headers.get("X-User-UID")