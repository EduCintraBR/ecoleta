import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'

import './styles.css'

const SuccessPage = () => {
    const history = useHistory()
    useEffect(() =>{
        setTimeout(() => {
            history.push('/')
        }, 1000)
    }, [])

    return (
        <div id="page">
            <div className="content">
                <span>
                    <FiCheckCircle size="40" color="#00FF7F"/>
                </span>
                <h1>Cadastro Concluído</h1>
            </div>
        </div>
    )
}

export default SuccessPage