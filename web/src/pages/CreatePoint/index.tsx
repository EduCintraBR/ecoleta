import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker  } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'


import api from '../../services/api'
import './styles.css'
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone/index'

interface Items {
    id: number
    title: string
    image_url: string
}
interface IBGEEstados {
    id: number
    nome: string
    sigla: string
}
interface IBGECidades {
    id: number
    nome: string
}

const CreatePoint = () => {
    const history = useHistory()
   
    //QUANDO FOR UM ARRAY OU UM OBJETO: É OBRIGATÓRIO INFORMAR MANUALMENTE O TIPO DA VARIAVEL
    const [ items, setItems ] = useState<Items[]>([])
    const [ estados, setEstados ] = useState<IBGEEstados[]>([])
    const [ cidades, setCidades ] = useState<IBGECidades[]>([])

    const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0,0])
    const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>([0,0])

    const [ selectedUf, setSelectedUf ] = useState('0')
    const [ selectedCity, setSelectedCity ] = useState('0')
    const [ selectedItem, setSelectedItem ] = useState<number[]>([])
    const [ selectedFile, setSelectedFile ] = useState<File>()

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords
            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get('items').then(result => {
            setItems(result.data)
        })
    }, [])

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(result => {
            setEstados(result.data)
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(result => {
            setCidades(result.data)
        })
    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        setSelectedUf(uf)
    }
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value
        setSelectedCity(city)
    }
    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setFormData({...formData, [name]: value })
    }

    function handleSelectItem (id : number) {
        const alreadySelected = selectedItem.findIndex( item => item === id)
        if (alreadySelected >= 0) {
            const filteredItems = selectedItem.filter(item => item !== id)
            setSelectedItem(filteredItems)
        } else {
            setSelectedItem([ ...selectedItem, id ])   
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [ latitude, longitude ] = selectedPosition
        const items = selectedItem

        const data = new FormData()
           
        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('uf', uf)
        data.append('city', city)
        data.append('items', items.join(','))

        if(selectedFile){
            data.append('image', selectedFile)
        }

        await api.post('points', data)

        history.push('/success')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para a home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email"onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa.</span>
                    </legend>
                    
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0" >Selecione uma UF</option>
                                {estados.map(uf => (
                                    <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                { cidades.map(city => (
                                    <option key={city.id} value={city.nome}>{city.nome}</option>  
                                )) }
                            </select>
                        </div>
                    </div>
                </fieldset> 

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo.</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            //SEMPRE QUE PASSAR UMA FUNÇÃO OU OBJETO COMO PARAMETRO USAR UMA ARROW FUNCTION COMO ABAIXO
                            <li key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItem.includes(item.id) ? 'selected' : ''}    
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>  

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint