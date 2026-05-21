import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid' // For unique IDs

export function useCurriculum(initialData = []) {
  const [sections, setSections] = useState(initialData)

  // 1. Add a New Section
  const addSection = (title = "New Section") => {
    const newSection = {
      id: uuidv4(),
      title: title,
      lessons: []
    }
    setSections([...sections, newSection])
  }

  // 2. Add a Lesson to a specific Section
  const addLesson = (sectionId, lessonTitle = "New Lesson") => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: [
            ...section.lessons,
            { id: uuidv4(), title: lessonTitle, type: 'video' }
          ]
        }
      }
      return section
    }))
  }

  // 3. Remove a Section
  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  // 4. Update Section Title
  const updateSectionTitle = (sectionId, newTitle) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title: newTitle } : s
    ))
  }

  return {
    sections,
    addSection,
    addLesson,
    removeSection,
    updateSectionTitle
  }
}