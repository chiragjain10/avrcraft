// src/pages/Blog/Blog.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Blog.module.css'

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Art of Handmade Crafts",
      excerpt: "Discover the beauty and tradition behind our handmade products...",
      date: "March 15, 2024",
      image: "https://via.placeholder.com/300x200",
      category: "Craftsmanship"
    },
    {
      id: 2,
      title: "Sustainable Materials We Use",
      excerpt: "Learn about our commitment to sustainability and eco-friendly materials...",
      date: "March 10, 2024",
      image: "https://via.placeholder.com/300x200",
      category: "Sustainability"
    },
    {
      id: 3,
      title: "Meet Our Artisans: A Story of Skill",
      excerpt: "Behind every product is a skilled artisan with years of experience...",
      date: "March 5, 2024",
      image: "https://via.placeholder.com/300x200",
      category: "Artisans"
    }
  ]

  return (
    <div className={styles.blogPage}>
      <div className={styles.container}>
        <h1>AVR Crafts Blog</h1>
        <p className={styles.subtitle}>Stories, tips, and insights from the world of handmade crafts</p>
        
        <div className={styles.blogGrid}>
          {blogPosts.map(post => (
            <article key={post.id} className={styles.blogCard}>
              <div className={styles.imageContainer}>
                <img src={post.image} alt={post.title} />
                <span className={styles.category}>{post.category}</span>
              </div>
              <div className={styles.content}>
                <h2>{post.title}</h2>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.date}>{post.date}</span>
                  <Link to={`/blog/${post.id}`} className={styles.readMore}>Read More →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Blog