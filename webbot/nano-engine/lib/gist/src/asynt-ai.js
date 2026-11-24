/*
- Scrape Asynt-ai By lanaasad
- Base : https://asyntai.com
- GROUP : https://chat.whatsapp.com/IyzRzK9dqEKIcovJybOKlu?mode=ems_copy_t
*/

async function asyntai(message, sessionId = null) {
    let currentSessionId = null;
    
    function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 12);
}

    if (!sessionId && !currentSessionId) {
        currentSessionId = generateSessionId();
    }
    const requestData = {
        widget_id: "asyntai_2bcd9dfbae24",
        message: message,
        session_id: sessionId || currentSessionId
    };
    try {
        const response = await fetch("https://asyntai.com/api/widget-chat/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.session_id) {
            currentSessionId = data.session_id;
        }
        return data.reply;
    } catch (error) {
        console.error('Error saat ngirim chat:', error);
        throw error;
    }
}


// asyntai("Halo, apakabar");