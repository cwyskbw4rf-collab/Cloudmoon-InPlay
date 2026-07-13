const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const AD_PATTERNS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'tpc.googlesyndication.com',
  'video-ad-stats.googlesyndication.com',
  'ads.google.com',
  'adssettings.google.com',
  'static.ads-twitter.com',
  'ads-api.twitter.com',
  'ads.facebook.com',
  'an.facebook.com',
  'adnxs.com',
  'advertising.com',
  'outbrain.com',
  'taboola.com',
  'criteo.com',
  'pubmatic.com',
  'rubiconproject.com',
  'openx.net',
  'adsafeprotected.com',
  'moatads.com',
  'scorecardresearch.com',
  '/ads/',
  '/ad/',
  '/advert/',
  '/advertisement/',
  '/adsense/',
  '/adserver/',
  '/analytics/',
  'prebid',
  'advertis',
  'banner',
  'popup'
];

function isAdRequest(url) {
  const urlLower = url.toLowerCase();
  return AD_PATTERNS.some((pattern) => urlLower.includes(pattern));
}

function blockAdsInHTML(html) {
  html = html.replace(/<script[^>]*googlesyndication[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*adsbygoogle[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*google-analytics[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*doubleclick[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[^>]*googlesyndication[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<iframe[^>]*doubleclick[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<ins[^>]*adsbygoogle[^>]*>[\s\S]*?<\/ins>/gi, '');
  html = html.replace(/<div[^>]*id="google_ads[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  return html;
}

function getMainHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Classroom</title>
    <meta name="description" content="Play Roblox, Fortnite, Call of Duty Mobile, Delta Force, and more in your browser">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2d2d2d">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="CloudMoon">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/favicon.png">
    
    <link rel="icon" id="favicon" type="image/png" href="/favicon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            overflow: hidden;
        }
        
        #container {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        #frame-container {
            flex: 1;
            width: 100%;
            height: 100%;
            background: white;
            position: relative;
        }
        
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            outline: none;
        }
        
        iframe:focus {
            outline: none;
        }

        /* Floating button dock — bottom left */
        #btn-dock {
            position: fixed;
            bottom: 18px;
            left: 18px;
            display: flex;
            flex-direction: row;
            gap: 10px;
            z-index: 9999;
            transition: opacity 0.3s;
        }

        #btn-dock.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .dock-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: rgba(45, 45, 45, 0.85);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            color: #e0e0e0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            transition: background 0.2s, transform 0.15s;
        }

        .dock-btn:hover {
            background: rgba(74, 74, 74, 0.95);
        }

        .dock-btn:active {
            transform: scale(0.93);
        }

        #install-btn {
            display: none;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="frame-container"></div>
    </div>

    <!-- Floating bottom-left controls -->
    <div id="btn-dock">
        <button class="dock-btn" id="home-btn" onclick="goBack()" title="Home">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/>
            </svg>
        </button>
        <button class="dock-btn" id="fullscreen-btn" onclick="enterFullscreen()" title="Fullscreen">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
        </button>
        <button class="dock-btn" id="install-btn" onclick="installPWA()" title="Install App">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
        </button>
    </div>

    <script>
        const frameContainer = document.getElementById('frame-container');
        const homeBtn = document.getElementById('home-btn');
        const btnDock = document.getElementById('btn-dock');
        
        let isShowingGame = false;
        let mainURL = '/web.cloudmoonapp.com/';
        let shadowRoots = [];
        let currentIframe = null;
        
        const SANDBOX_HOME = 'allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock allow-top-navigation-by-user-activation';
        const SANDBOX_GAME = 'allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock allow-top-navigation-by-user-activation';
        const ALLOW_PERMISSIONS = 'accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; clipboard-read; clipboard-write; xr-spatial-tracking; gamepad';
        
        const SHADOW_LAYERS = 4;
        
        function createMultiLayerShadowFrame(url, isGame = false) {
            frameContainer.innerHTML = '';
            shadowRoots = [];
            
            let currentHost = document.createElement('div');
            currentHost.style.width = '100%';
            currentHost.style.height = '100%';
            currentHost.style.margin = '0';
            currentHost.style.padding = '0';
            currentHost.style.border = 'none';
            currentHost.style.display = 'block';
            currentHost.style.overflow = 'hidden';
            currentHost.setAttribute('data-id', generateRandomId());
            currentHost.setAttribute('data-component', 'container');
            
            frameContainer.appendChild(currentHost);
            
            for (let i = 0; i < SHADOW_LAYERS; i++) {
                const shadowRoot = currentHost.attachShadow({ mode: 'closed' });
                shadowRoots.push(shadowRoot);
                
                if (i < SHADOW_LAYERS - 1) {
                    const nextHost = document.createElement('div');
                    nextHost.style.width = '100%';
                    nextHost.style.height = '100%';
                    nextHost.style.margin = '0';
                    nextHost.style.padding = '0';
                    nextHost.style.border = 'none';
                    nextHost.style.display = 'block';
                    nextHost.style.overflow = 'hidden';
                    nextHost.setAttribute('data-layer', i.toString());
                    nextHost.setAttribute('data-id', generateRandomId());
                    
                    shadowRoot.appendChild(nextHost);
                    currentHost = nextHost;
                    
                    console.log('[Worker] Shadow DOM created sucessfully');
                } else {
                    const iframe = document.createElement('iframe');
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.margin = '0';
                    iframe.style.padding = '0';
                    iframe.style.display = 'block';
                    iframe.style.overflow = 'hidden';
                    
                    const sandboxAttr = isGame ? SANDBOX_GAME : SANDBOX_HOME;
                    iframe.setAttribute('sandbox', sandboxAttr);
                    iframe.setAttribute('allow', ALLOW_PERMISSIONS);
                    iframe.setAttribute('title', isGame ? 'Game Preview' : 'CloudMoon Preview');
                    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                    iframe.setAttribute('importance', 'high');
                    iframe.setAttribute('loading', 'eager');
                    iframe.setAttribute('data-frame-id', generateRandomId());
                    iframe.setAttribute('data-secure', 'true');
                    
                    iframe.src = url;
                    
                    shadowRoot.appendChild(iframe);
                    currentIframe = iframe;
                    
                    iframe.addEventListener('load', () => {
                        focusIframe();
                    });
                    
                    iframe.addEventListener('error', (e) => {
                        console.error('Iframe error:', e);
                    });
                    
                    console.log('[Worker] Fianal Shadow DOM created sucessfully');
                }
            }
            
            console.log('[Worker] Layer shadow DOM Active');
        }
        
        function generateRandomId() {
            return 'x' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }
        
        function createShadowFrame(url, isGame = false) {
            createMultiLayerShadowFrame(url, isGame);
        }
        
        function focusIframe() {
            setTimeout(() => {
                if (currentIframe) {
                    currentIframe.focus();
                    try {
                        currentIframe.contentWindow.focus();
                    } catch (e) {
                        // Cross-origin, expected
                    }
                }
            }, 100);
        }
        
        // Initialize with multi-layer shadow DOM
        createMultiLayerShadowFrame(mainURL, false);
        
        document.addEventListener('click', (e) => {
            if (currentIframe && e.target !== currentIframe) {
                focusIframe();
            }
        });
        
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data && event.data.type === 'LOAD_GAME') {
                const gameUrl = event.data.url;
                console.log('[Worker] Game streem / URL received to be redirected to the client:', gameUrl);
                loadGame(gameUrl);
            }
        });
        
        function loadGame(url) {
            let fixedURL = url;
            const workerDomain = window.location.origin;
            
            // Check if URL is already on our worker domain
            if (url.includes(workerDomain)) {
                // Already on our domain, use as-is (avoid double-proxying)
                fixedURL = url;
                console.log('[Worker] Game URL is already on worker domain, using the link directly');
            } else if (url.includes('://')) {
                // External URL - proxy it through worker
                fixedURL = workerDomain + '/proxy/' + encodeURIComponent(url);
                console.log('[Worker] External game URL detected, proxying the URL through worker');
            } else if (url.startsWith('/')) {
                // Relative URL - keep it (will be proxied automatically)
                fixedURL = url;
                console.log('[Worker] Relative game URL, using as-is in the worker');
            }
            
            console.log('[Worker] Game loaded sucessfully via the Shadow DOM');
            console.log('[Worker] Final game URL created by the worker:', fixedURL);
            
            createMultiLayerShadowFrame(fixedURL, true);
            
            isShowingGame = true;
        }
        
        function goBack() {
            createMultiLayerShadowFrame(mainURL, false);
            isShowingGame = false;

            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }

        function enterFullscreen() {
            // Send message to the injected script inside the iframe so it can
            // fullscreen #gameWrapper (the actual game element) via the Fullscreen API.
            // Fall back to fullscreening the outer frame container if no iframe is ready.
            if (currentIframe && currentIframe.contentWindow) {
                currentIframe.contentWindow.postMessage({ type: 'REQUEST_FULLSCREEN' }, window.location.origin);
            } else {
                const el = frameContainer;
                if (el.requestFullscreen) el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
            }
        }
        
        console.log('[Worker] Welcome to CLOUDMOON-INPLAY, a Cloudflare Workers proxy for Cloudmoon');
        console.log('[Worker] CLOUDMOON-INPLAY Proxy is active; establishing conections, and proxying the current page content');
        console.log('[Worker] Shadow DOM container establishing');
        
        // Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[Worker] PWA Service Worker has been registered successfully');
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[Worker Updater] New version of CLOUDMOON-INPLAY is available!');
                        }
                    });
                });

                navigator.serviceWorker.ready.then(() => {
                    console.log('[Worker] Service Worker is controlling the page for client navigation');
                });

            })
            .catch((error) => {
                console.log('[Worker] Navigational Service Worker registration failed:', error);
            });
    });
}
        
        let deferredPrompt;
        const installBtn = document.getElementById('install-btn');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'flex';
        });

        function installPWA() {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }).catch(() => {
                deferredPrompt = null;
            });
        }

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    <\/script>
</body>
</html>`;
}

function getManifest() {
  return JSON.stringify({
    "id": "/?source=pwa",
    "name": "Google Classroom",
    "short_name": "Classroom",
    "description": "A Simple way for Parents, Students, And teachers to connect trought learning using Googles most powerfull Google classroom version yet",
    "start_url": "/?source=pwa",
    "scope": "/",
    "display": "standalone",
    "display_override": ["standalone", "minimal-ui"],
    "background_color": "#0d1117",
    "theme_color": "#2d2d2d",
    "orientation": "any",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icon.svg",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any"
      }
    ],
    "categories": ["games", "entertainment"],
    "prefer_related_applications": false
  });
}

function getServiceWorker() {
  return `// CloudMoon InPlay Service Worker
const CACHE_NAME = 'cloudmoon-v3';
const RUNTIME_CACHE = 'cloudmoon-runtime-v3';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing the PWA');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching the app shell');
      const critical = ['/', '/manifest.json', '/sw.js'];
      const optional = ['/favicon.png', '/icon.svg', '/icon-192.png', '/icon-512.png'];
      await cache.addAll(critical);
      await Promise.allSettled(
        optional.map(url =>
          fetch(url).then(res => {
            if (res && res.status === 200) return cache.put(url, res);
          }).catch((err) => {
            console.log('[Service Worker] Optional resource not cached:', url, err);
          })
        )
      );
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] the PWA is currentley Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const reqPath = new URL(event.request.url).pathname;
  if (reqPath.startsWith('/run-site/') || reqPath.startsWith('/proxy/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch((error) => {
            console.error('[ServiceWorker] Cache put error:', error);
          });
        }
        return response;
      })
      .catch((error) => {
        console.log('[Service Worker] Fetch failed, trying cache:', event.request.url);
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('', { 
            status: 200, 
            statusText: 'OK',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});`;
}

// Routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Permissions-Policy', 'accelerometer=*, gyroscope=*, camera=*, microphone=*, geolocation=*, hid=*, midi=*, clipboard-read=*, clipboard-write=*, xr-spatial-tracking=*, gamepad=*');
  res.send(getMainHTML());
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.send(getManifest());
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.send(getServiceWorker());
});

app.get('/favicon.png', async (req, res) => {
  try {
    const response = await fetch('https://ssl.gstatic.com/classroom/favicon.png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'image/png');
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching icon');
  }
});

app.get('/icon.svg', async (req, res) => {
  try {
    let response = await fetch('https://fonts.gstatic.com/s/i/productlogos/classroom/v8/192px.svg');
    if (!response.ok) {
      response = await fetch('https://ssl.gstatic.com/classroom/favicon.png');
    }
    res.setHeader('Content-Type', response.ok && response.headers.get('content-type').includes('svg') ? 'image/svg+xml' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching icon');
  }
});

app.get('/icon-192.png', async (req, res) => {
  try {
    let response = await fetch('https://fonts.gstatic.com/s/i/productlogos/classroom/v8/192px.png');
    if (!response.ok) {
      response = await fetch('https://ssl.gstatic.com/classroom/favicon.png');
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching icon');
  }
});

app.get('/icon-512.png', async (req, res) => {
  try {
    let response = await fetch('https://fonts.gstatic.com/s/i/productlogos/classroom/v8/512px.png');
    if (!response.ok) {
      response = await fetch('https://fonts.gstatic.com/s/i/productlogos/classroom/v8/192px.png');
    }
    if (!response.ok) {
      response = await fetch('https://ssl.gstatic.com/classroom/favicon.png');
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching icon');
  }
});

// Proxy route
app.all('*', async (req, res) => {
  let targetURL;
  
  if (req.path.startsWith('/proxy/')) {
    const encodedURL = req.path.substring('/proxy/'.length);
    try {
      targetURL = decodeURIComponent(encodedURL);
      if (req.url.includes('?')) {
        targetURL += '?' + req.url.split('?')[1];
      }
    } catch (e) {
      console.error('Failed to decode proxy URL:', encodedURL);
      return res.status(400).send('Invalid proxy URL');
    }
  } else {
    targetURL = 'https://web.cloudmoonapp.com' + req.path + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
  }
  
  if (isAdRequest(targetURL)) {
    console.log('[Ad Blocked]', targetURL);
    return res.status(204).send('');
  }
  
  console.log('Proxying:', targetURL);
  
  try {
    const headers = {
      'Host': new URL(targetURL).host,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    };
    
    // Copy request headers except Cf- headers
    Object.keys(req.headers).forEach(key => {
      if (!key.startsWith('cf-') && key !== 'host' && key !== 'connection') {
        headers[key] = req.headers[key];
      }
    });
    
    const proxyRes = await fetch(targetURL, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      redirect: 'follow'
    });
    
    const contentType = proxyRes.headers.get('content-type') || '';
    const newHeaders = {};
    
    // Copy response headers
    proxyRes.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        newHeaders[key] = value;
      }
    });
    
    newHeaders['Access-Control-Allow-Origin'] = '*';
    newHeaders['Access-Control-Allow-Methods'] = '*';
    newHeaders['Access-Control-Allow-Headers'] = '*';
    delete newHeaders['content-security-policy'];
    delete newHeaders['x-frame-options'];
    
    res.status(proxyRes.status);
    Object.keys(newHeaders).forEach(key => {
      res.setHeader(key, newHeaders[key]);
    });
    
    if (contentType.includes('text/html')) {
      let html = await proxyRes.text();
      html = blockAdsInHTML(html);
      const injectionCode = `<style id="cm-ad-blocker-css">
  .a-div-horizontal, .a-div-vertical, .a-div-placeholder, .a-div-box {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }
</style>
<script id="cm-fix-js">
(function(){
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && isAdUrl(url)) {
      console.log('[Ad Blocked]', url);
      return Promise.reject(new Error('Ad blocked'));
    }
    return originalFetch.apply(this, args);
  };
  
  const originalXHR = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url) {
    if (isAdUrl(url)) {
      console.log('[Ad Blocked]', url);
      return;
    }
    return originalXHR.apply(this, arguments);
  };
  
  function isAdUrl(url) {
    const adPatterns = ['googlesyndication', 'doubleclick', 'googleadservices', 'google-analytics', 'googletagmanager', 'googletagservices', '/ads/', '/ad/', '/advert', 'adsense', 'analytics', 'facebook.com/ads', 'twitter.com/ads'];
    return adPatterns.some(pattern => url.toLowerCase().includes(pattern));
  }
  
  function removeAds() {
    const googleAdSelectors = ['iframe[src*="googlesyndication"]', 'iframe[src*="doubleclick"]', 'iframe[src*="google-analytics"]', 'div[id*="google_ads"]', 'div[class*="adsbygoogle"]', 'ins.adsbygoogle', '[data-ad-slot]', '[data-ad-client]'];
    googleAdSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
        try { el.remove(); } catch (e) {}
      });
    });
    const adDivs = document.querySelectorAll('.a-div-horizontal, .a-div-vertical, .a-div-placeholder, .a-div-box');
    adDivs.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.position = 'absolute';
      el.style.width = '0';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      try { el.remove(); } catch (e) {}
    });
  }
  
  removeAds();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      removeAds();
    });
  }
  setInterval(removeAds, 200);
  var observer = new MutationObserver(removeAds);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
})();
<\/script>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', injectionCode + '</head>');
      } else {
        html = injectionCode + html;
      }
      res.send(html);
    } else if (contentType.includes('javascript')) {
      if (isAdRequest(targetURL)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.send('// Ad script blocked');
      } else {
        proxyRes.body.pipe(res);
      }
    } else {
      proxyRes.body.pipe(res);
    }
  } catch (error) {
    console.error('Proxy fetch failed:', error);
    res.status(502).send('Failed to fetch resource');
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Cloudmoon InPlay running on port ${PORT}`);
  console.log(`[Server] Open http://localhost:${PORT} in your browser`);
});
