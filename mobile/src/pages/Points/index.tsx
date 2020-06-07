import React, { useState, useEffect } from 'react'
import { 
          View, 
          StyleSheet, 
          TouchableOpacity, 
          Text,
          FlatList,
          Image,
          Alert,
        } 
from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Feather as Icon } from '@expo/vector-icons'
import Map, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location'

import api from '../../services/api'

interface Items {
  id: number
  title: string
  image_url: string
}
interface Points {
  id: number
  image: string
  image_url: string
  name: string
  latitude: number
  longitude: number
}
interface Params {
  selectedUf: string
  selectedCity: string
}

const Points = () => {
  const navigator = useNavigation()
  const route = useRoute()

  const parametros = route.params as Params

  const [ items, setItems ] = useState<Items[]>([])
  const [ points, setPoints ] = useState<Points[]>([])
  const [ selectedItem, setSelectedItem ] = useState<number[]>([])
  const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0,0])

  useEffect(() => {
    async function loadPosition(){
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ops...', 'Precisamos de sua permissão para obter sua localização.')
        return;
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords;

      setInitialPosition([latitude, longitude])
    } 

    loadPosition();
  }, [])

  useEffect(() => {
    api.get('items').then( res => {
      setItems(res.data)
    })
  }, [])

  useEffect(() => {
    const query = {
      city: parametros.selectedCity,
      uf: parametros.selectedUf,
      items: selectedItem.map(item => [item]).join(', ')
    }
    api.get('points', { params: query }
    ).then(res => {
      setPoints(res.data)
    })
  }, [selectedItem])

  function handleNavigateGoBack() {
      navigator.goBack()
  }
  function handleNavigateToDetail(id: number){
    navigator.navigate('Detail', { id })
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

  return (
    <>
      <View style={styles.container}>
          <TouchableOpacity onPress={handleNavigateGoBack}>
              <Icon name="arrow-left" size={30} color="#34cb79"/>
          </TouchableOpacity>

          <Text style={styles.title}>Bem Vindo.</Text>
          <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

          <View style={styles.mapContainer}>
            { initialPosition[0] !== 0 && (
              <Map style={styles.map}
                initialRegion={{
                  latitude: initialPosition[0],
                  longitude: initialPosition[1],
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
              >
                {points.map(point =>(
                  <Marker key={point.id}
                    style={styles.mapMarker}
                    onPress={() => handleNavigateToDetail(point.id)}
                    coordinate={{
                      latitude: point.latitude,
                      longitude: point.longitude,
                    }}
                  >
                  <View style={styles.mapMarkerContainer}>
                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }}></Image>
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
                ))}
              </Map>
            )}
          </View>
      </View>

      <View style={styles.itemsContainer}>
        <FlatList
          style={{ paddingHorizontal: 20 }} 
          data={items} 
          horizontal
          showsHorizontalScrollIndicator={false} 
          keyExtractor={item => String(item.id)} 
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.item,
                selectedItem.includes(item.id) ? styles.selectedItem : {}
              ]} 
              activeOpacity={0.6} 
              onPress={()=>handleSelectItem(item.id)} 
            >
              <SvgUri width={48} height={48} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points