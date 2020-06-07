import React, { useState, useEffect } from 'react';
import { View, 
        Image, 
        StyleSheet ,
        Text,
        ImageBackground} 
from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select'
import axios from 'axios'

interface IBGEEstados {
  id: number
  nome: string
  sigla: string
}
interface IBGECidades {
  id: number
  nome: string
}

const Home = () => {
    const navigation = useNavigation()
    const [ estados, setEstados ] = useState<IBGEEstados[]>([])
    const [ cidades, setCidades ] = useState<IBGECidades[]>([])
    const [ selectedUf, setSelectedUf ] = useState('0')
    const [ selectedCity, setSelectedCity ] = useState('0')

    const serializedUf = estados.map(item => {
      return {
          label: item.nome,
          value: item.sigla
      }
    })
    const serializedCity = cidades.map(item => {
      return {
          label: item.nome,
          value: item.nome
      }
    })

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

    function handleNavigationToPoints() {
      navigation.navigate('Points', { selectedUf, selectedCity})
    }
    function handleSelectUf(uf: string) {
      setSelectedUf(uf)
    }
    function handleSelectCity(city: string) {
      setSelectedCity(city)
    }

    return (
        <ImageBackground source={require('../../assets/home-background.png')} style={styles.container} imageStyle={{ width:274, height:368 }}>
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            </View>

            <View style={styles.footer}>
                <RNPickerSelect
                    items={serializedUf}
                    onValueChange={(value) => handleSelectUf(value)}
                    
                />
                <RNPickerSelect
                    onValueChange={(value) => handleSelectCity(value)}
                    items={serializedCity}
                />

                <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                    <View style={styles.buttonIcon}>
                        <Icon name="log-in" color="#fff" size={24} />
                    </View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>

        </ImageBackground>
    )
}

const styles = StyleSheet.create ({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},


  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home