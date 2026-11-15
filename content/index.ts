import { posts as core } from "./posts/core";
import { posts as security } from "./posts/security";
import { posts as practice } from "./posts/practice";
import { posts as craft } from "./posts/craft";
import { posts as news } from "./posts/news";

export const allPosts = [...news, ...core, ...security, ...practice, ...craft];
