class NoCacheMiddleware:
    """Prevent browser caching of API responses.

    Adds Cache-Control: no-cache, no-store, must-revalidate to all /api/
    responses to avoid stale cached data causing issues like CORS failures.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Only apply to API routes
        if request.path.startswith('/api/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        return response
