import React from 'react';
import { View, TouchableOpacity, StyleSheet, Share, Image } from 'react-native';

const Header = () => {
    const handleShare = async () => {
        try {
            await Share.share({
                message: 'I walked 9,592 steps today! 💪 #StepCounter',
            });
        } catch (error) {
            console.error('Share Error:', error);
        }
    };

    const handleLeftArrow = () => {
        console.log('⬅ Previous');
    };

    return (
        <View style={styles.wrapper}>
            {/* Left Arrow */}
            {/* <TouchableOpacity onPress={handleLeftArrow} style={styles.arrowButton}>
        <Image
          source={require('../../assets/icons/arrow-left.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity> */}

            {/* Share Button */}
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Image
                    source={require('../../assets/stepIcons/share.png')}
                    style={styles.icon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // left arrow left, share button right
        marginTop: 25,
        marginHorizontal: 10,
    },
    arrowButton: {
        padding: 6,
    },
    shareButton: {
        padding: 6,
    },
    icon: {
        width: 22,
        height: 22,
        tintColor: '#fff',
    },
});
