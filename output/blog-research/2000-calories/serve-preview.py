"""Serve only this reading preview and blog illustrations on localhost."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import mimetypes

ROOT = Path(__file__).resolve().parents[3]

class Preview(BaseHTTPRequestHandler):
    def do_GET(self):
        url = self.path.split('?')[0]
        if url in ['/', '/preview.html']:
            file = ROOT / 'output/blog-research/2000-calories/preview.html'
        elif url.startswith('/blog/') and url.endswith(('.webp', '.svg')):
            file = (ROOT / 'public' / url.lstrip('/')).resolve()
            if not file.is_relative_to(ROOT / 'public/blog'):
                self.send_error(404)
                return
        else:
            self.send_error(404)
            return
        if not file.is_file():
            self.send_error(404)
            return
        content = file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'text/html')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

print('Draft reading preview: http://127.0.0.1:3082', flush=True)
ThreadingHTTPServer(('127.0.0.1', 3082), Preview).serve_forever()
