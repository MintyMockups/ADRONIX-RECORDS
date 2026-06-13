// api/create-channel.js (Vercel Serverless Function format)

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, artist } = req.query;

    if (!userId || !artist) {
        return res.status(400).send('Missing parameter query: userId or artist.');
    }

    // Secure credentials configured within your serverless hosting dashboard
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const GUILD_ID = process.env.DISCORD_GUILD_ID;
    const CATEGORY_ID = process.env.DISCORD_CATEGORY_ID; 
    const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID; 

    if (!BOT_TOKEN || !GUILD_ID) {
        return res.status(500).send('Configuration missing: BOT_TOKEN or GUILD_ID on server.');
    }

    try {
        // Construct permission overrides to keep this channel private
        // Permission key 1024 refers to VIEW_CHANNEL. Deny everyone first.
        const permissionOverwrites = [
            {
                id: GUILD_ID, // Guild ID targets the @everyone role to deny channel access
                type: 0, 
                deny: "1024" 
            }
        ];

        // 1. Grant access to Staff Role (if configured)
        if (STAFF_ROLE_ID) {
            permissionOverwrites.push({
                id: STAFF_ROLE_ID,
                type: 0,
                allow: "3072" // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
            });
        }

        // 2. Grant access to Applicant (the candidate)
        const isNumericUserId = /^\d{17,19}$/.test(userId);
        if (isNumericUserId) {
            permissionOverwrites.push({
                id: userId,
                type: 1, // User type
                allow: "3072" // VIEW_CHANNEL + SEND_MESSAGES
            });
        }

        // Clean name to conform to Discord channel naming patterns
        const sanitizedArtist = artist
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const channelName = `demo-${sanitizedArtist || 'review'}`;

        // Create the channel using the official Discord API
        const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: channelName,
                type: 0, // Text channel format
                parent_id: CATEGORY_ID || null, // Optional: Category placement
                permission_overwrites: permissionOverwrites
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Discord channel request failed: ${errorDetails}`);
        }

        const newChannel = await response.json();

        // Send an introductory message inside the channel, tagging the user and staff
        const mentionUser = isNumericUserId ? `<@${userId}>` : `**${userId}**`;
        const mentionStaff = STAFF_ROLE_ID ? `<@&${STAFF_ROLE_ID}>` : 'Staff';

        await fetch(`https://discord.com/api/v10/channels/${newChannel.id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `👋 Welcome ${mentionUser}! This private text channel was successfully generated to discuss your demo with ${mentionStaff}.`
            })
        });

        // Display a clean confirmation screen to the Administrator's browser
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Channel Created</title>
                <style>
                    body { font-family: -apple-system, system-ui, sans-serif; background-color: #202225; color: #fff; text-align: center; padding-top: 60px; }
                    .card { background-color: #2f3136; max-width: 480px; margin: 0 auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                    h1 { color: #43b581; margin-top: 0; }
                    p { color: #b9bbbe; line-height: 1.5; font-size: 1.1rem; }
                    .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #5865f2; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
                    .btn:hover { background-color: #4752c4; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Success!</h1>
                    <p>Channel <strong>#${channelName}</strong> has been successfully configured.</p>
                    <a class="btn" href="https://discord.com/channels/${GUILD_ID}/${newChannel.id}" target="_blank">Open Discord Channel</a>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(error);
        return res.status(500).send(`API Error during channel execution: ${error.message}`);
    }
}
