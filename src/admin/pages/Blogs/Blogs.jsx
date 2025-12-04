import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { adminBlogs } from '../../utils/firebase/adminConfig'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import BlogForm from '../../components/blogs/BlogForm/BlogForm'
import styles from './Blogs.module.css'

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)

  const { addNotification } = useAdmin()

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const blogsData = await adminBlogs.getBlogs()
      setBlogs(blogsData)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load blogs'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddBlog = () => {
    setEditingBlog(null)
    setShowModal(true)
  }

  const handleEditBlog = (blog) => {
    setEditingBlog(blog)
    setShowModal(true)
  }

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return

    try {
      await adminBlogs.deleteBlog(blogId)
      setBlogs(blogs.filter(b => b.id !== blogId))
      addNotification({
        type: 'success',
        message: 'Blog post deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting blog:', error)
      addNotification({
        type: 'error',
        message: 'Failed to delete blog post'
      })
    }
  }

  const handleSaveBlog = async (blogData) => {
    try {
      if (editingBlog) {
        // Update existing blog
        await adminBlogs.updateBlog(editingBlog.id, blogData)
        
        // Update local state
        setBlogs(blogs.map(b => 
          b.id === editingBlog.id ? { 
            ...b, 
            ...blogData,
            // Preserve existing values if not provided
            image: blogData.image || b.image,
            featuredImage: blogData.image || b.featuredImage
          } : b
        ))
        
        addNotification({
          type: 'success',
          message: 'Blog post updated successfully'
        })
      } else {
        // Add new blog
        const newBlog = await adminBlogs.addBlog(blogData)
        setBlogs([newBlog, ...blogs])
        addNotification({
          type: 'success',
          message: 'Blog post published successfully'
        })
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error saving blog:', error)
      addNotification({
        type: 'error',
        message: `Failed to ${editingBlog ? 'update' : 'publish'} blog post: ${error.message}`
      })
      throw error // Re-throw to handle in form
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const handleViewBlog = (blog) => {
    // In a real app, this would navigate to the blog post
    // For now, we'll just show an alert
    alert(`Viewing blog: ${blog.title}\n\nThis would open the blog post in a new tab in a real application.`)
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const columns = [
    {
      key: 'title',
      label: 'Blog Post',
      render: (blog) => (
        <div className={styles.blogInfo}>
          {blog.image && (
            <div className={styles.blogImage}>
              <img src={blog.image} alt={blog.title} />
            </div>
          )}
          <div className={styles.blogContent}>
            <h4 className={styles.blogTitle}>{blog.title}</h4>
            <p className={styles.blogExcerpt}>
              {blog.excerpt ? truncateText(blog.excerpt, 120) : truncateText(blog.content, 120)}
            </p>
            {blog.tags && blog.tags.length > 0 && (
              <div className={styles.blogTags}>
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className={styles.blogTag}>
                    #{tag}
                  </span>
                ))}
                {blog.tags.length > 3 && (
                  <span className={styles.moreTags}>+{blog.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'author',
      label: 'Author',
      render: (blog) => (
        <div className={styles.authorInfo}>
          <User size={14} />
          <span>{blog.author || 'Admin'}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'Published',
      render: (blog) => (
        <div className={styles.dateInfo}>
          <Calendar size={14} />
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'views',
      label: 'Views',
      render: (blog) => (
        <div className={styles.viewsCount}>
          <Eye size={14} />
          <span>{blog.views || 0}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (blog) => (
        <span className={`${styles.status} ${
          blog.isActive ? styles.active : styles.inactive
        }`}>
          {blog.isActive ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (blog) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleViewBlog(blog)}
            title="View blog post"
          >
            <Eye size={16} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditBlog(blog)}
            title="Edit blog post"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => handleDeleteBlog(blog.id)}
            title="Delete blog post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '120px'
    }
  ]

  return (
    <div className={styles.blogs}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Blog Management</h1>
          <p className={styles.pageSubtitle}>
            Create and manage blog posts for your store
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryButton}
            onClick={handleAddBlog}
          >
            <Plus size={18} />
            Write New Post
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <FileText size={24} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>{blogs.length}</h3>
            <p className={styles.statLabel}>Total Posts</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Eye size={24} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>
              {blogs.reduce((total, blog) => total + (blog.views || 0), 0)}
            </h3>
            <p className={styles.statLabel}>Total Views</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Calendar size={24} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>
              {blogs.filter(blog => blog.isActive).length}
            </h3>
            <p className={styles.statLabel}>Published</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search blog posts by title, content, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={filteredBlogs}
          loading={loading}
          emptyMessage={
            blogs.length === 0 
              ? "No blog posts found. Write your first blog post to get started." 
              : "No blog posts match your search criteria."
          }
          keyExtractor={(blog) => blog.id}
        />
      </div>

      {/* Add/Edit Blog Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingBlog ? 'Edit Blog Post' : 'Write New Blog Post'}
          size="xlarge"
        >
          <BlogForm
            blog={editingBlog}
            onSave={handleSaveBlog}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Blogs