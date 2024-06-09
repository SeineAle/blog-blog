import { Appbar } from "../components/Appbar"
import  BlogCard from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return <div>
            <Appbar /> 
            <div>
                <BlogSkeleton/>
                <BlogSkeleton/>
                <BlogSkeleton/>
                <BlogSkeleton/>
            </div>
        </div>
    }
    // console.log(blogs);
    return <div>
        <Appbar />
        <div  className="flex justify-center">
            <div>
                {blogs.map(blog =>{ 
                    const dateString = blog.date;
                    const dateObject = new Date(dateString);
                    const publishedDateVal = dateObject.toLocaleDateString();
                    if(blog.published) return <BlogCard
                    id={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    title={blog.title}
                    content={blog.content}
                    publishedDate= {publishedDateVal}
                />
                else return<></>})}
            </div>
        </div>
    </div>
}
export default Blogs