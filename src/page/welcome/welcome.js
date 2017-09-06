import React from 'react'
import styles from './welcome.less'

export default React.createClass({
  render(){
    return (
      <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" version="1.1">
        <text x="20" y="75" className={styles.svgText}>welcome to erp!</text>
      </svg>
    )
  }
})
