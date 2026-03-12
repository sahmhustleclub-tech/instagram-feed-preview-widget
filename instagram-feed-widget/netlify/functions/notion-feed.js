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

    const items = (data.results || [])
      .map((page) => {
        const props = page.properties || {};

        const title = props["content title"]?.title?.[0]?.plain_text || "Untitled";
        const publishDate = props["Publish Date"]?.date?.start || "";
        const order = props["Order"]?.number ?? 9999;
        const platform = props["Platform"]?.select?.name || "";
        const imageSource = props["Image Source"]?.select?.name || "";
        const imageLink = props["Image Link"]?.rich_text?.[0]?.plain_text || "";
        const canvaLink = props["Canva Link"]?.url || "";

        const files = props["Attachment"]?.files || [];
        const attachmentUrls = files
          .map((file) => file.file?.url || file.external?.url || "")
          .filter(Boolean);

        const attachmentUrl = attachmentUrls[0] || "";

        let feedImage = "";

        if (imageSource === "Attachment" && attachmentUrl) {
          feedImage = attachmentUrl;
        } else if (imageSource === "Image Link" && imageLink) {
          feedImage = imageLink;
        } else if (imageSource === "Canva Link" && canvaLink) {
          feedImage = canvaLink;
        } else {
          feedImage = attachmentUrl || imageLink || canvaLink || "";
        }

        return {
          id: page.id,
          title,
          publishDate,
          order,
          platform,
          imageSource,
          imageLink,
          canvaLink,
          attachmentUrl,
          attachmentUrls,
          feedImage,
          isCarousel: attachmentUrls.length > 1
        };
      })
      .filter((item) => (item.platform || "").toLowerCase() === "instagram");

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