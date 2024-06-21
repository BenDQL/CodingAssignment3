import {
  Application,
  send,
  Router,
  NativeRequest,
} from "https://deno.land/x/oak/mod.ts";
import {
  multiParser,
  FormFile,
} from "https://deno.land/x/multiparser@0.114.0/mod.ts";

const app = new Application();

const apiRouter = new Router({ prefix: "/api" });
apiRouter.post("/upload", async (context) => {
  // Deal with upload image and photography parameters
  const form = await multiParser(
    (context.request.originalRequest as NativeRequest).request
  );
  if (form) {
    const image: FormFile = form.files.file as FormFile;
    try {
      const readfile = await Deno.readFile("public/config.json");
      const configStr = new TextDecoder().decode(readfile);
      const currentConfig = eval(configStr);
      const filenameArr = image.filename.split(".");
      const ext = filenameArr[filenameArr.length - 1];
      const currentId = currentConfig[currentConfig.length - 1]["img"]
        .split("_")[1]
        .split(".")[0];
      const id = Number(currentId) + 1;
      const renameFile = `img_${id}.${ext}`;

      const updatedConfig = [
        ...currentConfig,
        {
          img: renameFile,
          iso: form.fields.iso,
          lens: `${form.fields.lens}mm`,
          fRatio: form.fields.fRatio,
          sec: form.fields.sec,
        },
      ];
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(updatedConfig));
      await Deno.writeFile(`public/images/${renameFile}`, image.content);
      await Deno.writeFile(`public/config.json`, data);
    } catch (e) {
      console.error(e);
    }
  }
  context.response.body = '{"status": "ok"}';
});

app.use(apiRouter.routes());

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

await app.listen({ port: 8000 });
