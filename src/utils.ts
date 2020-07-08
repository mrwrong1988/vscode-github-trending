export const getWebviewContentByUrl = (url: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <iframe width="100% height="100%" frameborder="0" marginheight="0" marginwidth="0" allowfullscreen="true" src="${url}" />
  </body>
  </html>`;
  // return `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <title>Cat Coding</title>
  // </head>
  // <body>
  //     <div style="color:red;">test</div>
  // </body>
  // </html>`;
};
