const { Client } = require("@notionhq/client");

const countApplicantCheckboxes = async (pageId: string) => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  });

  const data = await notion.pages.retrieve({
    page_id: pageId,
  });

  const properties = data.properties;

  let count = 0;

  for (const property in properties) {
    if (
      properties[property].hasOwnProperty("checkbox") &&
      properties[property].checkbox
    ) {
      count += 1;
    }
  }

  return count;
};

export default countApplicantCheckboxes;
