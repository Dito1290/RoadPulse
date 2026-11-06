import logging

from rest_framework import status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def json_exception_handler(exc, context):
    """Error API selalu berupa JSON dengan kunci `error` (dibaca web & mobile)."""
    if isinstance(exc, Throttled):
        wait = int(exc.wait or 0)
        return Response(
            {'error': f'Terlalu banyak percobaan. Coba lagi dalam {max(wait, 1)} detik.', 'retry_after': wait},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={'Retry-After': str(wait)} if wait else None,
        )

    response = exception_handler(exc, context)
    if response is not None:
        if isinstance(response.data, dict) and 'error' not in response.data and 'detail' in response.data:
            response.data = {'error': str(response.data['detail'])}
        return response

    # Error tak terduga (mis. database gagal): catat di log server, jangan kirim halaman HTML 500.
    logger.exception('Unhandled API error', exc_info=exc)
    return Response(
        {'error': 'Terjadi kesalahan di server. Coba lagi nanti.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
