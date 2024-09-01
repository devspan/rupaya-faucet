const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.FAVICON_GENERATOR_API_KEY;
const LOGO_PATH = path.join(process.cwd(), 'public', 'rupayalogodark.svg');

if (!API_KEY) {
  console.error('FAVICON_GENERATOR_API_KEY is not set in the environment variables.');
  process.exit(1);
}

interface FaviconConfiguration {
  master_picture: {
    type: string;
    content: string;
  };
  files_location: {
    type: string;
    path: string;
  };
  favicon_design: {
    desktop_browser: {};
    ios: {
      picture_aspect: string;
      margin: string;
      background_color: string;
    };
    windows: {
      picture_aspect: string;
      background_color: string;
    };
    android_chrome: {
      picture_aspect: string;
      theme_color: string;
      manifest: {
        name: string;
        display: string;
        orientation: string;
      };
    };
    safari_pinned_tab: {
      picture_aspect: string;
      threshold: number;
      theme_color: string;
    };
  };
  settings: {
    compression: string;
    scaling_algorithm: string;
    error_on_image_too_small: boolean;
    readme_file: boolean;
    html_code_file: boolean;
    use_path_as_is: boolean;
  };
}

const faviconConfiguration: FaviconConfiguration = {
  master_picture: {
    type: 'inline',
    content: fs.readFileSync(LOGO_PATH, { encoding: 'base64' }),
  },
  files_location: {
    type: 'path',
    path: '/',
  },
  favicon_design: {
    desktop_browser: {},
    ios: {
      picture_aspect: 'background_and_margin',
      margin: '10%',
      background_color: '#ffffff',
    },
    windows: {
      picture_aspect: 'no_change',
      background_color: '#da532c',
    },
    android_chrome: {
      picture_aspect: 'no_change',
      theme_color: '#ffffff',
      manifest: {
        name: 'Rupaya Faucet',
        display: 'standalone',
        orientation: 'portrait',
      },
    },
    safari_pinned_tab: {
      picture_aspect: 'black_and_white',
      threshold: 60,
      theme_color: '#5bbad5',
    },
  },
  settings: {
    compression: '5',
    scaling_algorithm: 'Mitchell',
    error_on_image_too_small: true,
    readme_file: false,
    html_code_file: false,
    use_path_as_is: false,
  },
};

const requestData = JSON.stringify({
  favicon_generation: faviconConfiguration,
  api_key: API_KEY,
});

const options = {
  hostname: 'realfavicongenerator.net',
  port: 443,
  path: '/api/favicon',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    if (response.favicon_generation_result.result.status === 'success') {
      const package_url = response.favicon_generation_result.favicon.package_url;
      console.log('Favicon package URL:', package_url);
      console.log('Download and extract the package into your public folder.');
    } else {
      console.error('Favicon generation failed:', response.favicon_generation_result.result.error_message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(requestData);
req.end();