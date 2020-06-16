import { useCMS, usePlugins } from "tinacms";
import { useRouter } from "next/router";
import slugify from "slugify";
import { FORM_ERROR } from "final-form";

import { Post } from "../interfaces";
import toMarkdownString from "../utils/toMarkdownString";

const useCreateBlogPage = (allBlogs: Array<Post>) => {
  const router = useRouter();
  const cms = useCMS();
  usePlugins([
    {
      __type: "content-creator",
      name: "Make a new blog post",
      // @ts-ignore
      fields: [
        {
          name: "title",
          label: "Title",
          component: "text",
          required: true,
          validate(value: string) {
            if (!value) {
              return "A title is required";
            }
            if (
              allBlogs.some(
                (post: Post) =>
                  post.fileName === slugify(value, { lower: true })
              )
            ) {
              return "Sorry the blog title must be unique";
            }
          },
        },
        {
          name: "author",
          label: "Author",
          component: "text",
          required: true,
        },
        {
          name: "date",
          label: "Date",
          component: "date",
          dateFormat: "MMMM DD YYYY",
          timeFormat: false,
          required: true,
        },
        {
          name: "description",
          label: "Description",
          component: "textarea",
          required: false,
        },
      ],
      onSubmit: async (frontMatter: any) => {
        const github = cms.api.github;
        const slug = slugify(frontMatter.title, { lower: true });
        const fileRelativePath = `content/blog/${slug}.md`;
        frontMatter.date = frontMatter.date || new Date().toString();
        return await github
          .commit(
            fileRelativePath,
            null,
            toMarkdownString({
              fileRelativePath,
              rawFrontmatter: {
                ...frontMatter,
              },
            }),
            "Update from TinaCMS"
          )
          .then(() => {
            setTimeout(() => router.push(`/blog/new/${slug}`), 1500);
          })
          .catch((e: any) => {
            return { [FORM_ERROR]: e };
          });
      },
    },
  ]);
};

export default useCreateBlogPage;
