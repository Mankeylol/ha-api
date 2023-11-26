const WebSocket = require('ws')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;
const app = express()
app.use(express.json());
app.use(cors())



const server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

let messageIdCounter = 1

const HA_WS_URL = 'ws://192.168.1.241:8123/api/websocket'

const ws = new WebSocket(HA_WS_URL)

ws.on('open', () => {
  console.log('Connected to Home Assistant WebSocket')

  // Authenticate with Home Assistant
  const authMessage = {
    type: 'auth',
    access_token: HA_ACCESS_TOKEN
  }

  ws.send(JSON.stringify(authMessage))
})

ws.on('message', data => {
  const message = JSON.parse(data.toString('utf8'))
  console.log('Received message from Home Assistant:', message)

  if (message.type === 'auth_required') {
    // Continue with the authentication process if necessary
    // (This might involve sending additional information)
  } else if (message.type === 'auth_invalid') {
    console.error('Authentication failed:', message.message)
  } else if (message.type === 'auth_ok') {
    // Authentication successful, send a turn-on light command

    app.post('/api/turn-on-light', (req, res) => {
      const { entity_id,effect } = req.body

      if (!entity_id) {
        return res
          .status(400)
          .json({ success: false, message: 'entity_id is required' })
      }

      const turnOnLightCommand = {
        id: messageIdCounter++,
        type: 'call_service',
        domain: 'light',
        service: 'turn_on',
        service_data: {
          entity_id: entity_id,
          effect:effect,
        }
      }
      ws.send(JSON.stringify(turnOnLightCommand))
      res.status(200).json({ success: true, message: 'Turned on the light' })
    })

    app.post('/api/turn-off-light', (req, res) => {
        const { entity_id } = req.body;
      
        if (!entity_id) {
          return res.status(400).json({ success: false, message: 'entity_id is required' });
        }
      
        const turnOnLightCommand = {
          id: messageIdCounter++,
          type: 'call_service',
          domain: 'light',
          service: 'turn_off',
          service_data: {
            entity_id: entity_id,
          },
        };
      
        ws.send(JSON.stringify(turnOnLightCommand));
        res.status(200).json({ success: true, message: 'Turned off the light' });
      });


      app.post('/api/turn-on-tv', (req, res) => {
        const { entity_id } = req.body;
      
        if (!entity_id) {
          return res.status(400).json({ success: false, message: 'entity_id is required' });
        }
      
        const turnOnTvCommand = {
          id: messageIdCounter++,
          type: 'call_service',
          domain: 'media_player',
          service: 'turn_on',
          service_data: {
            entity_id: entity_id,
          },
        };
      
        ws.send(JSON.stringify(turnOnTvCommand));
        res.status(200).json({ success: true, message: 'Turned on the TV' });
      });

      app.post('/api/turn-off-tv', (req, res) => {
        const { entity_id } = req.body;
      
        if (!entity_id) {
          return res.status(400).json({ success: false, message: 'entity_id is required' });
        }
      
        const turnOnTvCommand = {
          id: messageIdCounter++,
          type: 'call_service',
          domain: 'media_player',
          service: 'turn_off',
          service_data: {
            entity_id: entity_id,
          },
        };
      
        ws.send(JSON.stringify(turnOnTvCommand));
        res.status(200).json({ success: true, message: 'Turned on the TV' });
      });

      app.post('/api/play-media', (req, res) => {
        const { entity_id, media_content_id, media_content_type } = req.body;
    
        if (!entity_id || !media_content_id || !media_content_type) {
            return res.status(400).json({ success: false, message: 'entity_id, media_content_id, and media_content_type are required' });
        }
    
        const playMediaCommand = {
            id: messageIdCounter++, // Increment the ID
            type: 'call_service',
            domain: 'media_player',
            service: 'play_media',
            service_data: {
                entity_id: entity_id,
                media_content_id: media_content_id,
                media_content_type: media_content_type,
            },
        };
    
        ws.send(JSON.stringify(playMediaCommand));
        res.status(200).json({ success: true, message: 'Started playing media on the TV' });
    });

   

    const playMediaCommand = {
      id: 3,
      type: 'call_service',
      domain: 'media_player',
      service: 'play_media',
      service_data: {
        entity_id: 'media_player.oneplus_tv', // Replace with your media player entity_id
        media_content_id: 'https://imgur.com/ACUDONc.jpg', // Replace with the path to your media file
        media_content_type: 'image/jpg' // Adjust based on your media file type
      }
    }
  }
})

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} - ${reason}`)
})

ws.on('error', error => {
  console.error('WebSocket error:', error.message)
})