import os
from cloudinary_storage.storage import MediaCloudinaryStorage, RESOURCE_TYPES


# File extensions mapped to Cloudinary resource types
IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg', 'ico', 'heic', 'heif'}
VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v', '3gp', 'ogv', 'mpeg', 'mpg'}
RAW_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'rar', 'gz'}


class SmartCloudinaryStorage(MediaCloudinaryStorage):
    """Cloudinary storage that dynamically selects the resource_type based on file extension.

    Standard MediaCloudinaryStorage always uses resource_type='image', which causes
    Cloudinary to reject video files with a 400 error. This class detects the file
    type from the extension and uses the appropriate resource type ('image', 'video', or 'raw').
    """

    def _get_resource_type(self, name):
        ext = os.path.splitext(name)[1].lower().lstrip('.')
        if ext in IMAGE_EXTENSIONS:
            return RESOURCE_TYPES['IMAGE']
        elif ext in VIDEO_EXTENSIONS:
            return RESOURCE_TYPES['VIDEO']
        else:
            return RESOURCE_TYPES['RAW']
