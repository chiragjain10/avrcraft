// src/pages/Artisans/Artisans.jsx
import React from 'react'
import styles from './Artisans.module.css'

const Artisans = () => {
  const artisans = [
    {
      id: 1,
      name: "Rajesh Kumar",
      skill: "Pottery",
      location: "Jaipur, Rajasthan",
      experience: "15 years",
      image: "https://via.placeholder.com/200x200",
      description: "Specializes in traditional blue pottery with modern designs."
    },
    {
      id: 2,
      name: "Meera Sharma",
      skill: "Textile Weaving",
      location: "Varanasi, Uttar Pradesh",
      experience: "12 years",
      image: "https://via.placeholder.com/200x200",
      description: "Creates exquisite Banarasi silk sarees with intricate zari work."
    },
    {
      id: 3,
      name: "Arun Patel",
      skill: "Wood Carving",
      location: "Saharanpur, Uttar Pradesh",
      experience: "20 years",
      image: "https://via.placeholder.com/200x200",
      description: "Master of traditional wood carving techniques."
    }
  ]

  return (
    <div className={styles.artisansPage}>
      <div className={styles.container}>
        <h1>Meet Our Artisans</h1>
        <p className={styles.subtitle}>The skilled hands behind every AVR Crafts product</p>
        
        <div className={styles.artisansGrid}>
          {artisans.map(artisan => (
            <div key={artisan.id} className={styles.artisanCard}>
              <div className={styles.imageContainer}>
                <img src={artisan.image} alt={artisan.name} />
              </div>
              <div className={styles.artisanInfo}>
                <h2>{artisan.name}</h2>
                <p className={styles.skill}>{artisan.skill}</p>
                <p className={styles.location}>📍 {artisan.location}</p>
                <p className={styles.experience}>🎯 {artisan.experience} experience</p>
                <p className={styles.description}>{artisan.description}</p>
                <button className={styles.viewProducts}>View Products</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.joinSection}>
          <h2>Are you an Artisan?</h2>
          <p>Join our community and showcase your crafts to the world.</p>
          <button className={styles.joinBtn}>Apply Now</button>
        </div>
      </div>
    </div>
  )
}

export default Artisans