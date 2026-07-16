export const STORAGE_KEY = 'community-posts-v1'

export function normalizePost(post) {
  return {
    ...post,
    comments: Array.isArray(post.comments)
      ? post.comments.map((comment, index) => normalizeComment(comment, index + 1))
      : [],
    likes: Number(post.likes) || 0,
    views: Number(post.views) || 0,
    password: post.password || '',
    tags: Array.isArray(post.tags) ? post.tags : []
  }
}

export function loadPosts(defaultPosts = []) {
  if (typeof window === 'undefined') {
    return defaultPosts.map((post) => normalizePost({ ...post, comments: [] }))
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const basePosts = saved ? JSON.parse(saved) : defaultPosts
    const cleanedPosts = (Array.isArray(basePosts) ? basePosts : defaultPosts).map((post) =>
      normalizePost({ ...post, comments: [] })
    )

    savePosts(cleanedPosts)
    return cleanedPosts
  } catch {
    const cleanedPosts = defaultPosts.map((post) => normalizePost({ ...post, comments: [] }))
    savePosts(cleanedPosts)
    return cleanedPosts
  }
}

export function savePosts(posts) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function createPostEntry(payload, id = Date.now()) {
  return normalizePost({
    id,
    title: payload.title,
    author: '익명',
    category: payload.category || '자유게시판',
    date: new Date().toISOString().slice(0, 10),
    views: 0,
    likes: 0,
    summary: payload.content.slice(0, 60),
    content: payload.content,
    tags: ['익명', '새글'],
    password: payload.password,
    comments: []
  })
}

export function updatePostEntry(posts, postId, payload) {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post
    }

    return normalizePost({
      ...post,
      title: payload.title,
      content: payload.content,
      summary: payload.content.slice(0, 60),
      date: new Date().toISOString().slice(0, 10)
    })
  })
}

export function deletePostEntry(posts, postId) {
  return posts.filter((post) => post.id !== postId)
}

export function incrementViewCount(posts, postId) {
  return posts.map((post) => {
    if (post.id === postId) {
      return normalizePost({ ...post, views: Number(post.views) + 1 })
    }
    return post
  })
}

export function toggleLike(posts, postId) {
  return posts.map((post) => {
    if (post.id === postId) {
      return normalizePost({ ...post, likes: Number(post.likes) + 1 })
    }
    return post
  })
}

export function addComment(posts, postId, commentPayload) {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post
    }

    const comments = Array.isArray(post.comments) ? post.comments : []
    const anonymousNumber = comments.length + 1
    const comment = normalizeComment(commentPayload, anonymousNumber)
    return normalizePost({
      ...post,
      comments: [...comments, comment]
    })
  })
}

export function normalizeComment(commentPayload = {}, fallbackIndex = 1) {
  const anonymousNumber = typeof commentPayload.anonymousNumber === 'number' ? commentPayload.anonymousNumber : fallbackIndex

  return {
    id: commentPayload.id || Date.now(),
    author: commentPayload.author || `익명 ${anonymousNumber}`,
    content: commentPayload.content,
    createdAt: commentPayload.createdAt || new Date().toISOString().slice(0, 10)
  }
}

export function filterPosts(posts, searchTerm, searchField = 'all') {
  const term = searchTerm.trim().toLowerCase()
  if (!term) {
    return posts
  }

  return posts.filter((post) => {
    const values = {
      all: [post.title, post.author, post.category, post.summary, post.content, ...(post.tags || [])],
      title: [post.title],
      author: [post.author],
      category: [post.category],
      content: [post.summary, post.content]
    }

    return values[searchField]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
}
