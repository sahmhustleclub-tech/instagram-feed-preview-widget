exports.handler = async function () {
  const token = process.env.NOTION_TOKEN;
  const database = process.env.NOTION_DATABASE_ID;

  if (!token || !database) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID"
      })
    };
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${database}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        sorts: [
          {
            property: "Order",
            direction: "ascending"
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify(data)
      };
    }

    const items = (data.results || []).map((page) => {
      const props = page.properties || {};
      const files = props["Attachment"]?.files || [];

      let image = "";
      if (files.length > 0) {
        image = files[0].file?.url || files[0].external?.url || "";
      }

      return {
        id: page.id,
        feedImage: image
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items })
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