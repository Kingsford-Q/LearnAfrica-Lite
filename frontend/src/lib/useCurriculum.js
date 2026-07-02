import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid' // For unique IDs

export function useCurriculum(initialData = []) {
  const [sections, setSections] = useState(initialData)

  // 1. Add a New Section
  const addSection = (title = "New Section") => {
    const newSection = {
      id: uuidv4(),
      title: title,
      order: sections.length,
      lessons: []
    }
    setSections([...sections, newSection])
  }

  // 2. Add a curriculum item (lesson or quiz) to a specific Section
  const addLesson = (sectionId, type = 'video') => {
    setSections(sections.map(section => {
      if (section.id !== sectionId) return section
      const item = type === 'quiz'
        ? { id: uuidv4(), type: 'quiz', title: '', questions: [] }
        : { id: uuidv4(), type: 'video', title: '', videoUrl: '', content: '' }
      return { ...section, lessons: [...section.lessons, item] }
    }))
  }

  // 3. Update a curriculum item within a section (partial merge)
  const updateLesson = (sectionId, itemId, data) => {
    setSections(sections.map(section => {
      if (section.id !== sectionId) return section
      return {
        ...section,
        lessons: section.lessons.map(item => item.id === itemId ? { ...item, ...data } : item)
      }
    }))
  }

  // 4. Remove a curriculum item from a section
  const removeLesson = (sectionId, itemId) => {
    setSections(sections.map(section => {
      if (section.id !== sectionId) return section
      return { ...section, lessons: section.lessons.filter(item => item.id !== itemId) }
    }))
  }

  // 5. Remove a Section
  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  // 6. Update Section Title
  const updateSectionTitle = (sectionId, newTitle) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, title: newTitle } : s
    ))
  }

  // 7. Replace the whole curriculum (used to restore a saved draft or reset the form)
  const resetSections = (newSections = []) => {
    setSections(newSections)
  }

  return {
    sections,
    addSection,
    addLesson,
    updateLesson,
    removeLesson,
    removeSection,
    updateSectionTitle,
    resetSections
  }
}
