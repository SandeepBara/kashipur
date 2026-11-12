import { globalStyle } from '../styles/globalStyle'
import { Text, View } from 'react-native'

function DetailCard({title,infoFields=[]}) {
  return (
    <View style={globalStyle.card}>
        {title && (
            <View style={globalStyle.infoCardHeader}><Text style={globalStyle.cardHeaderText}>Basic Info</Text></View>
        )}
        <View style={globalStyle.infoGrid}>
            {infoFields.map((item, idx) => (
                <View key={idx} style={globalStyle.infoCell}>
                <Text style={globalStyle.infoLabel}>{item.label}:</Text>
                <Text selectable={true} style={globalStyle.infoValue}>{item.value || '-'}</Text>
                </View>
            ))}
        </View>
    </View>
  )
}

export default DetailCard
