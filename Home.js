import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Home({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [titulo, setTitulo] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [nombreElemento, setNombreElemento] = useState('');
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('');
  const [elementosData, setElementosData] = useState([]);
  const [fecha, setFecha] = useState(moment().toDate());
  const [porcentaje, setPorcentaje] = useState('20');
  const [showDatePicker, setShowDatePicker] = useState(false);
  let dias = 0
  let pagado = 0
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };
  const agregar = async () => {
    try {
      const objetoAGuardar = {
        monto: monto*((porcentaje/100)+1),
        plazo: plazo,
        dias: 0,
        fecha: moment(fecha).format('DD-MM-YYYY'),
        porcentaje: porcentaje,
        pagado: 0
      };
      await AsyncStorage.setItem(nombreElemento, JSON.stringify(objetoAGuardar));
      navigation.replace('Inicio');
      console.log('Valor guardado con éxito');
    } catch (error) {
      console.log('Error al guardar el valor:', error);
    }
  }  
const agregarElemento = () => {
  agregar();
  setIsVisible2(false);
}
const modal = () => {
setIsVisible(!isVisible);
};
const modal2 = () => {
  pagado = 0
setIsVisible2(!isVisible2);
};
const tit = async() => {
  await AsyncStorage.setItem("yo", JSON.stringify({flag: true, nombre: nombre}));
}
const cambiarTitulo = () => {
  tit()
setTitulo(nombre);
setIsVisible(false);
};
const abrirDeudor = (elemento) => {
  navigation.navigate('Deudor', {elemento});
};

useEffect(() => {
  async function fetchData() {
    try {
      const todo = await AsyncStorage.getAllKeys();
      keys = todo.filter(key => key !== "yo");
      const nom = await AsyncStorage.getItem("yo");
      const yo = JSON.parse(nom);
      setTitulo(yo.nombre);
      const elementosDataPromises = keys.map(async (elemento) => {
        const str = await AsyncStorage.getItem(elemento);
        const data = JSON.parse(str);
        const fechaElemento = moment(data.fecha, 'DD-MM-YYYY');
        const diasElemento = data.dias || 0;
        const fechaLimite = moment().subtract(diasElemento, 'days');
        const hoy = moment();
        const debe = fechaElemento.isBefore(fechaLimite, 'day') && fechaElemento.isBefore(hoy, 'day');
        const textoDebe = moment().format('DD-MM-YYYY')===data.fecha?'':debe ? 'Hoy: Debe' : 'Hoy: Pagó';
        const colorDebe = debe ? 'red' : 'green';
        return {
          nombre: elemento,
          textoDebe,
          colorDebe,
          onPress: () => abrirDeudor(elemento),
        };
      });
      const elementosData = await Promise.all(elementosDataPromises);
      setElementosData(elementosData);
    } catch (error) {
      console.error(error);
    }
  }
  fetchData();
}, []);
const editarElemento = async(id) =>{
  const str = await AsyncStorage.getItem(id);
  const data = JSON.parse(str);
  const fecha = moment(data.fecha, 'DD-MM-YYYY')
  setNombreElemento(id)
  setMonto(data.monto.toString())
  setPlazo(data.plazo)
  setFecha(fecha.toDate())
  setPorcentaje("0")
  pagado=data.pagado
  setIsVisible2(!isVisible2);
}
return (
<View style={styles.container}>
<View style={styles.appBar}>
<Text style={styles.titulo}>{titulo}</Text>
<TouchableOpacity style={styles.boton} onPress={modal}>
<Text style={styles.botonTexto}>Editar</Text>
</TouchableOpacity>
</View>
<Modal visible={isVisible} animationType='slide'>
<View style={styles.modal}>
<Text style={styles.modalTitulo}>Editar Datos</Text>
<TextInput
style={styles.input}
placeholder='Nombre'
onChangeText={text => setNombre(text)}
value={nombre}
/>
<View style={styles.botones}>
<Button title='Cancelar' onPress={modal} />
<Button title='Confirmar' onPress={cambiarTitulo} />
</View>
</View>
</Modal>
<TouchableOpacity style={styles.botonFlotante} onPress={modal2}>
<Text style={styles.botonFlotanteTexto}>+</Text>
</TouchableOpacity>
<Modal visible={isVisible2} animationType='slide'>
      <View style={styles.modal}>
        <Text style={styles.modalTitulo}>Realizar Prestamo</Text>
        <View style={styles.modal}>
          <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Nombre'
            onChangeText={text => setNombreElemento(text)}
            value={nombreElemento}
          /></View>
          <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Monto (Bs)'
            onChangeText={text => setMonto(text)}
            value={monto}
            keyboardType='numeric'
          /></View>
          <View style={styles.inputContainer}>
          <TextInput
          style={styles.input}
          placeholder='Plazo (Dias)'
          onChangeText={text => setPlazo(text)}
          value={plazo}
          keyboardType='numeric'
        /></View>
         <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder='Fecha'
                value={moment(fecha).format('DD-MM-YYYY')}
                editable={false}
              />
              <Text style={styles.icon}>📅</Text>
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode='date'
              value={fecha}
              onChange={handleDateChange}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Porcentaje'
              onChangeText={text => setPorcentaje(text)}
              value={porcentaje}
              keyboardType='numeric'
            />
            <Text style={styles.icon}>%  =  {monto*(porcentaje/100)} Bs</Text>
          </View>
          <Text style={styles.icon}>Total a pagar: {monto*((porcentaje/100)+1)} Bs</Text>
          <Text style={styles.icon}>Estimado: {(monto*((porcentaje/100)+1))/plazo} Bs/dia</Text>
          <View style={styles.botones}>
            <Button title='Cancelar' onPress={modal2} />
            <Button title='Agregar' onPress={agregarElemento} />
          </View>
          </View>
      </View>
    </Modal>
    <ScrollView style={styles.scrollContainer}>
  <View style={styles.lista}>
    {elementosData.map((elementoData, index) => (
      <View style={styles.elementoContainer} key={index}>
        <TouchableOpacity style={styles.elemento} onPress={elementoData.onPress}>
          <Text style={styles.elementoTexto}>{elementoData.nombre}</Text>
          <Text style={[styles.elementoTexto, { color: elementoData.colorDebe }]}>{elementoData.textoDebe}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editarBoton}>
              <Text style={styles.icon} onPress={()=>editarElemento(elementoData.nombre)}>✏️</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
</ScrollView>
</View>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
alignItems: 'stretch',
justifyContent: 'center',
},
appBar: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
backgroundColor: '#0099ff',
padding: 10,
},
titulo: {
fontSize: 24,
fontWeight: 'bold',
color: '#fff',
},
boton: {
backgroundColor: '#fff',
padding: 10,
borderRadius: 5,
},
botonTexto: {
fontSize: 16,
color: '#0099ff',
},
botonFlotante: {
position: 'absolute',
bottom: 20,
right: 20,
backgroundColor: '#0099ff',
borderRadius: 30,
width: 60,
height: 60,
alignItems: 'center',
justifyContent: 'center',
elevation: 4,
zIndex: 999
},
botonFlotanteTexto: {
fontSize: 36,
fontWeight: 'bold',
color: '#fff',
},
modal: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  maxHeight: '90%',
  maxWidth: '90%',
  alignSelf: 'center',
  justifyContent: 'space-between'
},
modalTitulo: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 20
},
inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20
},
input: {
  flex: 1,
  height: 40,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 5,
  paddingLeft: 10,
  marginRight: 10
},
icon: {
  fontSize: 20,
  color: '#555'
},
botones: {
flexDirection: 'row',
justifyContent: 'space-around',
width: '100%',
marginTop: 20,
},
lista: {
flex: 1,
padding: 20,
},
elemento: {
  flex: 1,
backgroundColor: '#f0f0f0',
borderRadius: 5,
padding: 10,
marginVertical: 5,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
},
elementoTexto: {
fontSize: 16,
},
scrollContainer: {
  height: 200, // establece una altura adecuada
  overflow: 'scroll',
},
editarBoton: {
  backgroundColor: '#f2f2f2',
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
elementoContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  backgroundColor: '#fff',
  borderRadius: 8,
  overflow: 'hidden',
  elevation: 2,
justifyContent: 'space-between',
}, 
editarBoton: {
  borderRadius: 5,
  padding: 10,
  marginVertical: 5,
  alignItems: 'center',
  justifyContent: 'center',
},
});