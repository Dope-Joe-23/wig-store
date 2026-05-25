import os
from cloudinary_storage.storage import MediaCloudinaryStorage, RESOURCE_TYPES


# File extensions mapped to Cloudinary resource types
IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg', 'ico', 'heic', 'heif'}
VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v', '3gp', 'ogv', 'mpeg', 'mpg'}
RAW_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'rar', 'gz'}


def _detect_type_from_name(name):
    """Detect Cloudinary resource type from a filename (with extension).

    Returns ``'image'``, ``'video'``, ``'raw'``, or ``None`` if undetectable.
    """
    ext = os.path.splitext(name)[1].lower().lstrip('.')
    if not ext:
        return None
    if ext in IMAGE_EXTENSIONS:
        return 'image'
    if ext in VIDEO_EXTENSIONS:
        return 'video'
    if ext in RAW_EXTENSIONS:
        return 'raw'
    return None


class SmartCloudinaryStorage(MediaCloudinaryStorage):
    """Cloudinary storage that dynamically selects the resource_type based on file extension.

    Standard MediaCloudinaryStorage always uses resource_type='image', which causes
    Cloudinary to reject video files with a 400 error. This class detects the file
    type from the extension and uses the appropriate resource type.

    Because Cloudinary strips file extensions from public IDs, the resource type
    is encoded into the stored name (e.g., ``video::<public_id>``) so that URL
    generation and deletion can correctly identify the resource type later.
    """

    SEPARATOR = '::'

    # ── Save ──────────────────────────────────────────────────────────

    def _save(self, name, content):
        """Upload to Cloudinary and encode the resource type in the returned name."""
        resource_type = self._get_resource_type(name)
        public_id = super()._save(name, content)
        return f'{resource_type}{self.SEPARATOR}{public_id}'

    # ── Name decoding ────────────────────────────────────────────────

    def _decode(self, name):
        """Return ``(resource_type_str, actual_public_id)``.

        Handles both new names (``type::public_id``) and legacy names
        (plain public IDs with no extension → assume ``image``).
        """
        if self.SEPARATOR in name:
            raw_type, actual_id = name.split(self.SEPARATOR, 1)
            if raw_type in ('image', 'video', 'raw'):
                return raw_type, actual_id
        return 'image', name

    # ── Resource type detection ──────────────────────────────────────

    def _get_resource_type(self, name):
        # 1. Encoded name (type::public_id) — trust the encoding
        if self.SEPARATOR in name:
            raw_type, _ = self._decode(name)
            return RESOURCE_TYPES[raw_type.upper()]

        # 2. Unencoded name with extension (upload path or legacy data)
        detected = _detect_type_from_name(name)
        if detected:
            return RESOURCE_TYPES[detected.upper()]

        # 3. No extension at all — default to IMAGE (safest for existing data)
        return RESOURCE_TYPES['IMAGE']

    # ── URL generation ───────────────────────────────────────────────

    def _get_url(self, name):
        from cloudinary import CloudinaryResource
        raw_type, actual_id = self._decode(name)
        resource = CloudinaryResource(actual_id, default_resource_type=raw_type)
        return resource.build_url()

    # ── Delete ───────────────────────────────────────────────────────

    def delete(self, name):
        import cloudinary.uploader
        raw_type, actual_id = self._decode(name)
        cloudinary.uploader.destroy(actual_id, resource_type=raw_type)

    # ── Exists ───────────────────────────────────────────────────────

    def exists(self, name):
        import cloudinary.api
        from cloudinary.exceptions import Error as CloudinaryError
        raw_type, actual_id = self._decode(name)
        try:
            cloudinary.api.resource(actual_id, resource_type=raw_type)
            return True
        except CloudinaryError:
            return False

    # ── Size ─────────────────────────────────────────────────────────

    def size(self, name):
        import cloudinary.api
        raw_type, actual_id = self._decode(name)
        resource = cloudinary.api.resource(actual_id, resource_type=raw_type)
        return resource.get('bytes', 0)
