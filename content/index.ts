import { posts as core } from "./posts/core";
import { posts as security } from "./posts/security";
import { posts as practice } from "./posts/practice";
import { posts as craft } from "./posts/craft";

export const allPosts = [...core, ...security, ...practice, ...craft];
