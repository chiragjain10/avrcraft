import React from 'react'
import Hero from '../../components/home/Hero/Hero'
import Categories from '../../components/home/Categories/Categories'
import TrendingProducts from '../../components/home/TrendingProducts/TrendingProducts'
import Childrens from '../../components/childrens/childrens'
import ArtisanSpotlight from '../../components/home/ArtisanSpotlight/ArtisanSpotlight'
import Newsletter from '../../components/home/Newsletter/Newsletter'
import styles from './Home.module.css'

const Home = () => {
  return (
    <div className={styles.home}>
      <Hero />
      <Categories />
      <TrendingProducts />
      <Childrens />
      <ArtisanSpotlight />
      <Newsletter />
    </div>
  )
}

export default Home