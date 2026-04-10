const https = require('https');

const generateEmploymentContract = async (workerName, employerName, jobTitle, jobDescription, wage, arrivalDate, location) => {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) {
        console.warn("GROQ_API_KEY is missing. Skipping AI contract generation.");
        return null;
    }

    try {
        const prompt = `
        You are a highly professional legal AI. Generate a formal employment contract for the following position:
        - Job Title: ${jobTitle}
        - Employer: ${employerName}
        - Employee: ${workerName}
        - Description: ${jobDescription}
        - Wage: ${wage}
        - Start Date: ${arrivalDate}
        - Work Location: ${location}

        Return ONLY a well-structured, formal HTML document representing the contract. Use standard HTML tags (<h1>, <p>, <ul>, <br>). Add inline CSS for a professional, clean, and elegant legal document look (e.g., serif fonts, borders, signature lines at the bottom). Do not include markdown codeblocks (\`\`\`), just the raw HTML.
        `;

        const payload = {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        };

        const result = await makeGroqRequest(key, JSON.stringify(payload));
        return result.trim();
    } catch (err) {
        console.error(`[AI Contract Generation Error]`, err.message);
        return null;
    }
};

function makeGroqRequest(key, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (d) => data += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode !== 200) return reject(new Error(json.error?.message || "HTTP " + res.statusCode));
                    let content = json.choices[0].message.content;
                    // Clean markdown if AI accidentally includes it
                    content = content.replace(/^```html\s*/i, '').replace(/```$/i, '');
                    resolve(content);
                } catch (e) { reject(new Error("Invalid JSON response from AI")); }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
}

module.exports = { generateEmploymentContract };
