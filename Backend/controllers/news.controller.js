const News = require('../models/news')
const Admin = require('../models/admin')

exports.uploadNews = async (req, res) => {
  try {
    const adminId = req.user.id
    const { title, description, imageUrl, imagePublicId } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' })
    }

    const admin = await Admin.findById(adminId)
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    const news = await News.create({
      title,
      description,
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      uploadedBy: adminId,
      uploadedByName: admin.name,
    })

    res.status(201).json({
      success: true,
      message: 'News posted successfully',
      news,
    })
  } catch (error) {
    console.error('Upload news error:', error.message)
    res.status(500).json({ message: 'Failed to upload news' })
  }
}

exports.getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })

    res.json({
      success: true,
      news,
    })
  } catch (error) {
    console.error('Get news error:', error.message)
    res.status(500).json({ message: 'Failed to fetch news' })
  }
}

exports.deleteNews = async (req, res) => {
  try {
    const { newsId } = req.params

    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' })
    }

    const news = await News.findById(newsId)

    if (!news) {
      return res.status(404).json({ message: 'News not found' })
    }

    await News.findByIdAndDelete(newsId)

    res.json({
      success: true,
      message: 'News deleted successfully',
    })
  } catch (error) {
    console.error('Delete news error:', error.message)
    res.status(500).json({ message: 'Failed to delete news' })
  }
}
