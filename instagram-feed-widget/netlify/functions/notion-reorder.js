exports.handler = async function (event) {
  const token = process.env.NOTION_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing NOTION_TOKEN" })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const ids = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No ids received" })
      };
    }

    const results = [];

    for (let i = 0; i < ids.length; i++) {
      const pageId = ids[i];

      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({
          properties: {
            "Order": {
              number: i + 1
            }
          }
        })
      });

      const json = await res.json().catch(() => ({}));

      results.push({
        pageId,
        ok: res.ok,
        status: res.status,
        response: json
      });
    }

    const failed = results.filter((r) => !r.ok);

    if (failed.length) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Some Order updates failed",
          failed
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        updated: ids.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};