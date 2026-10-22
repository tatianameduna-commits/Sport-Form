# Google Forms version

`create-form.gs` builds the same startup form in Google Forms. It also creates a
Google Sheet that collects every response; the sheet takes the place of the database.

## Create the form (about 2 minutes)

1. Go to https://script.google.com and click **New project**.
2. Delete the sample code, paste in all of `create-form.gs`, and click **Save**.
3. Make sure `createStartupForm` is selected in the dropdown at the top, then click **Run**.
4. Google asks for permission. Click **Review permissions**, choose your account, then
   **Advanced** → **Go to project (unsafe)** → **Allow**. Google shows the "unsafe" warning
   for any script you write yourself; this one only creates a form and a sheet in your Drive.
5. The **Execution log** at the bottom shows three links: the form to share, the form
   editor, and the responses spreadsheet. The form and sheet are also in your Google Drive.

## Match the look (in the form editor)

Click the palette icon (**Customize theme**) at the top of the editor:

- **Header:** upload `header-image.png`.
- **Color:** add a custom color `#E4002B` (SSAC red).
- **Background:** pick the darkest shade.
- **Font:** choose a bold or condensed option for headers, if your account offers font choices.

## Use the results

- Every response appears as a new row in **SSAC Media Startups · Responses**.
- Total money raised: in the sheet, click an empty cell and type
  `=SUM(` then click the "Total money raised (USD)" column letter, and close with `)`.
- To share responses with your team, use **Share** on the sheet.
