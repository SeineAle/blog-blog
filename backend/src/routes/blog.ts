import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono';
import { verify } from 'hono/jwt'
import { createPostInput, updatePostInput } from '@seineale/blogblog-common';

export const blogRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId : string;
		isPublished : string;
    }
}>();

blogRouter.use('/*', async (c, next) => {
    const header = c.req.header("authorization") || "";
	const isPublished = c.req.header("publish") || "";
    const response = await verify(header, c.env.JWT_SECRET);
    if(response){
        //@ts-ignore
        c.set("userId", response.id);
		//@ts-ignore
        c.set("isPublished", isPublished);
        await next();
    }else{
        c.status(403);
        c.json({error : "unauthorized"});
    }
})


// add pagination

blogRouter.get('/bulk', async (c) => {
    const userId = c.get('userId');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    const blogs = await prisma.post.findMany();
    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})


blogRouter.post('/', async (c) => {
    const userId = c.get('userId');
	const isPublishedStr = c.get('isPublished');
	const isPublished = isPublishedStr === "true";
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
    const { success } = createPostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId,
			published : isPublished,
		}
	});
	return c.json({
		id: post.id
	});
})

blogRouter.put('/', async (c) => {
    const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	const body = await c.req.json();
    const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
	await prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});
    return c.text("post updated");
})
