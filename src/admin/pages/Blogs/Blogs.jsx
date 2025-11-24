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
    blog.author?.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!window.confirm('Are you sure you want to delete this blog post?')) return

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
        setBlogs(blogs.map(b => 
          b.id === editingBlog.id ? { ...b, ...blogData } : b
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
        message: `Failed to ${editingBlog ? 'update' : 'publish'} blog post`
      })
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    {
      key: 'title',
      label: 'Blog Post',
      render: (blog) => (
        <div className={styles.blogInfo}>
          <div className={styles.blogIcon}>
            <FileText size={20} />
          </div>
          <div>
            <h4 className={styles.blogTitle}>{blog.title}</h4>
            <p className={styles.blogExcerpt}>
              {blog.excerpt || blog.content?.substring(0, 100)}...
            </p>
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
        <span className={styles.viewsCount}>{blog.views || 0}</span>
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

      {/* Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search blog posts..."
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
          emptyMessage="No blog posts found. Write your first blog post to get started."
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