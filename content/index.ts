import { posts as core } from "./posts/core";
import { posts as security } from "./posts/security";
import { posts as practice } from "./posts/practice";
import { posts as craft } from "./posts/craft";
import { posts as news } from "./posts/news";
import { posts as projects } from "./posts/projects";

export const allPosts = [...projects, ...news, ...core, ...security, ...practice, ...craft];
